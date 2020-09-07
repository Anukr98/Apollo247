import { Connection } from 'typeorm';
import { Decimal } from 'decimal.js';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { MedicineOrderRefundsRepository } from 'profiles-service/repositories/MedicineOrderRefundsRepository';
//to avoid code duplication...
import { genchecksumbystring } from 'lib/paytmLib/checksum.js';
import {
  PAYTM_STATUS,
  REFUND_STATUS,
  MEDICINE_ORDER_PAYMENT_TYPE,
  DEVICE_TYPE,
} from 'profiles-service/entities';
import { OneApollo } from 'helpers/oneApollo';
import {
  MedicineOrderRefunds,
  MedicineOrderPayments,
  MedicineOrders,
} from 'profiles-service/entities/index';
import { medicineOrderRefundNotification } from 'notifications-service/handlers';

import { log } from 'customWinstonLogger';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { ApiConstants } from 'ApiConstants';
import { WebEngageInput, postEvent } from 'helpers/webEngage';
import { getStoreCodeFromDevice } from 'profiles-service/helpers/OneApolloTransactionHelper';

type RefundInput = {
  refundAmount: number;
  txnId: string;
  orderId: string;
  medicineOrderPayments: MedicineOrderPayments;
  medicineOrders: MedicineOrders;
};

type ResultInfo = {
  resultCode: string;
  resultMsg: string;
  resultStatus: PAYTM_STATUS;
};

export type PaytmResponse = {
  resultInfo: ResultInfo;
  orderId: string;
  refId: string;
  refundAmount: string;
  refundId: string;
  txnAmount: string;
  txnId: string;
  txnTimeStamp: string;
};

interface PaytmBody {
  refundAmount: string;
  txnId: string;
  mid: string;
  refId: string;
  txnType: string;
  orderId: string;
}

export interface PaytmHeadBody {
  head: {
    signature: unknown;
  };
  body: PaytmBody;
}

type refundMethod<refundInput, Context, Result> = (
  refundInput: refundInput,
  context: Context
) => AsyncIterator<Result> | Promise<Result>;

export const initiateRefund: refundMethod<RefundInput, Connection, Partial<PaytmResponse>> = async (
  refundInput,
  profilesDb: Connection
) => {
  try {
    const medicineOrderRefundRepo = profilesDb.getCustomRepository(MedicineOrderRefundsRepository);
    const saveRefundAttr: Partial<MedicineOrderRefunds> = refundInput;
    saveRefundAttr.refundStatus = REFUND_STATUS.REFUND_REQUEST_NOT_RAISED;
    const response = await medicineOrderRefundRepo.saveRefundInfo(saveRefundAttr);
    let mid = process.env.MID_PHARMACY ? process.env.MID_PHARMACY : '';
    if (refundInput.medicineOrderPayments.partnerInfo == ApiConstants.PARTNER_SBI)
      mid = process.env.SBI_MID_PHARMACY ? process.env.SBI_MID_PHARMACY : '';
    const paytmBody: PaytmBody = {
      mid,
      refId: response.refId,
      txnType: 'REFUND',
      txnId: refundInput.txnId,
      orderId: refundInput.orderId,
      refundAmount: '' + refundInput.refundAmount,
    };
    let merchantKey = process.env.PAYTM_MERCHANT_KEY_PHARMACY
      ? process.env.PAYTM_MERCHANT_KEY_PHARMACY
      : '';
    if (refundInput.medicineOrderPayments.partnerInfo == ApiConstants.PARTNER_SBI)
      merchantKey = process.env.SBI_PAYTM_MERCHANT_KEY_PHARMACY
        ? process.env.SBI_PAYTM_MERCHANT_KEY_PHARMACY
        : '';
    const checksumHash: string = await genCheckSumPromiseWrapper(paytmBody, merchantKey);
    const paytmParams: PaytmHeadBody = {
      head: {
        signature: checksumHash,
      },
      body: paytmBody,
    };
    log(
      'profileServiceLogger',
      'Paytm Request Body',
      'initiateRefund()',
      JSON.stringify(paytmParams),
      ''
    );
    const paytmResponse = await medicineOrderRefundRepo.raiseRefundRequestWithPaytm(
      paytmParams,
      process.env.PAYTM_REFUND_URL ? process.env.PAYTM_REFUND_URL : ''
    );
    log(
      'profileServiceLogger',
      'Paytm Request Body',
      'initiateRefund()',
      JSON.stringify(paytmResponse),
      ''
    );
    const resultStatus = paytmResponse.body.resultInfo.resultStatus as PAYTM_STATUS;

    // mid is not required in the response
    delete paytmResponse.body.mid;

    //response of this helper method
    const paytmResult: Partial<PaytmResponse> = {};

    // make copy of response body
    Object.assign(paytmResult, paytmResponse.body);

    const refundObj: Partial<MedicineOrderRefunds> = {};

    refundObj.resultCode = paytmResponse.body.resultInfo.resultCode;
    refundObj.resultMsg = paytmResponse.body.resultInfo.resultMsg;
    refundObj.paytmRequestStatus = resultStatus;

    // As refundObj does not store resultInfo, so delete it
    delete paytmResponse.body.resultInfo;
    Object.assign(refundObj, paytmResponse.body);

    switch (resultStatus) {
      case PAYTM_STATUS.TXN_FAILURE:
        refundObj.refundStatus = REFUND_STATUS.REFUND_FAILED;
        break;
      case PAYTM_STATUS.TXN_SUCCESS:
        refundObj.refundStatus = REFUND_STATUS.REFUND_SUCCESSFUL;
        break;
      case PAYTM_STATUS.PENDING:
        refundObj.refundStatus = REFUND_STATUS.REFUND_REQUEST_RAISED;
        break;
    }

    delete refundObj.refId;
    await medicineOrderRefundRepo.updateRefund(response.refId, refundObj);

    if (paytmResult.resultInfo) paytmResult.resultInfo.resultStatus = resultStatus;
    return paytmResult;
  } catch (e) {
    log('profileServiceLogger', JSON.stringify(refundInput), 'initiateRefund()', e.stack, 'true');
    throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, {});
  }
};

/**
 * Method for calculating refund amount and health credits
 * @param orderDetails MedicineOrders object with related objects(patient)
 * @param totalOrderBilling Total amount billed to the user, 0 in case of cancellation
 * @param profilesDb Connection to db
 * @param medOrderRepo MedicineOrdersRepository instance
 */
export const calculateRefund = async (
  orderDetails: MedicineOrders,
  totalOrderBilling: number,
  profilesDb: Connection,
  medOrderRepo: MedicineOrdersRepository,
  reasonCode?: string,
  deliveryCharges?: number
) => {
  const paymentInfo = await medOrderRepo.getRefundsAndPaymentsByOrderId(orderDetails.id);
  if (!paymentInfo) {
    throw new AphError(AphErrorMessages.PAYMENT_INFO_NOT_FOUND, undefined, {});
  }
  const {
    amountPaid,
    healthCreditsRedeemed,
    paymentRefId: txnId,
    healthCreditsRedemptionRequest,
  } = paymentInfo as MedicineOrderPayments;

  /**
   * Multiple refunds are possible so we need to see how much refund is initiated till now.
   */
  const totalRefundAmount = paymentInfo.medicineOrderRefunds.reduce((acc, curValue) => {
    if (
      curValue.refundStatus != REFUND_STATUS.REFUND_REQUEST_NOT_RAISED &&
      curValue.refundStatus != REFUND_STATUS.REFUND_FAILED
    ) {
      return +new Decimal(acc).plus(curValue.refundAmount);
    }
    return acc;
  }, 0);

  /**
   * Amount to be refunded for the order
   */
  let refundAmount: number = 0;

  // Health credits to be refunded
  let healthCreditsToRefund = 0;

  let isRefundSuccessful = false;

  // Maximum possible refund
  let maxRefundAmountPossible = +new Decimal(amountPaid).minus(totalRefundAmount);

  /**
   * Preference would be given to health credits consumption
   * We won't be refunding health credits if equation value is less than equals to 0
   */
  healthCreditsToRefund = +new Decimal(healthCreditsRedeemed).minus(totalOrderBilling);

  /**
   * We cannot refund money received for delivery
   */
  if (totalOrderBilling != 0 && deliveryCharges) {
    maxRefundAmountPossible = +new Decimal(maxRefundAmountPossible)
      .minus(+deliveryCharges)
      .minus(+orderDetails.packagingCharges);
    healthCreditsToRefund = +new Decimal(healthCreditsToRefund)
      .plus(+deliveryCharges)
      .plus(+orderDetails.packagingCharges);
  }
  /**
   * Refund all the money if health credits blocked are more than the amended order billing
   * Otherwise, refund the difference.
   */
  if (healthCreditsToRefund < 0) {
    refundAmount = +new Decimal(maxRefundAmountPossible).plus(healthCreditsToRefund);
  } else {
    refundAmount = maxRefundAmountPossible;
  }

  log(
    'profileServiceLogger',
    `HEALTH_CREDITS_TO_REFUND_FOR_ORDER - ${orderDetails.orderAutoId} -- ${
      healthCreditsToRefund > 0 ? healthCreditsToRefund : 0
    }`,
    `AMOUNT_TO_BE_REFUNDED_FOR_ORDER - ${orderDetails.orderAutoId} -- ${refundAmount}`,
    JSON.stringify(paymentInfo),
    ''
  );

  if (paymentInfo.paymentType != MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS && !totalOrderBilling) {
    medicineOrderRefundNotification(
      orderDetails,
      {
        refundAmount: 0,
        paymentInfo,
        healthCreditsRefunded: 0,
        isPartialRefund: false,
        reasonCode,
        isRefundSuccessful,
      },
      profilesDb
    );
  } else if (paymentInfo.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS) {
    const updatePaymentRequest: Partial<MedicineOrderPayments> = {};
    /**
     * We cannot refund less than 1 rs as per Paytm refunds policy
     */
    if (refundAmount >= 1) {
      const postBody: Partial<WebEngageInput> = {
        userId: orderDetails.patient.mobileNumber,
        eventName: ApiConstants.MEDICINE_ORDER_REFUND_PROCESSED_EVENT_NAME.toString(),
        eventData: {
          orderId: orderDetails.orderAutoId,
          orderStatus: paymentInfo.medicineOrders.currentStatus,
          refundAmount: refundAmount,
          healthCreditsToRefund: healthCreditsToRefund > 0 ? healthCreditsToRefund : 0,
        },
      };
      postEvent(postBody);

      let refundResp = await initiateRefund(
        {
          refundAmount,
          txnId,
          medicineOrderPayments: paymentInfo,
          medicineOrders: orderDetails,
          orderId: '' + orderDetails.orderAutoId,
        },
        profilesDb
      );
      refundResp = refundResp as PaytmResponse;
      if (refundResp.refundId) {
        isRefundSuccessful = true;
        const totalAmountRefunded = +new Decimal(refundAmount).plus(totalRefundAmount);
        updatePaymentRequest.refundAmount = totalAmountRefunded;

        const postBody: Partial<WebEngageInput> = {
          userId: orderDetails.patient.mobileNumber,
          eventName: ApiConstants.MEDICINE_ORDER_REFUND_SUCCESSFUL_EVENT_NAME.toString(),
          eventData: {
            orderId: orderDetails.orderAutoId,
            paymentRefundId: refundResp.refundId.toString(),
          },
        };
        postEvent(postBody);
      } else {
        log(
          'profileServiceLogger',
          `REFUND_REQUEST_FAILED - ${JSON.stringify(paymentInfo)}`,
          `HEALTH CREDITS UNBLOCKED_FOR_ORDER - ${orderDetails.orderAutoId}`,
          `${JSON.stringify(orderDetails)}`,
          'true'
        );
      }
    }

    if (healthCreditsToRefund > 0) {
      const blockedHealthCredits = +new Decimal(healthCreditsRedeemed).minus(healthCreditsToRefund);
      updatePaymentRequest.healthCreditsRedeemed = blockedHealthCredits;

      // check if healthCredits were blocked for the order
      if (healthCreditsRedemptionRequest && healthCreditsRedemptionRequest.RequestNumber) {
        /**
         * StoreCode for the OneApollo is decided based on deviceType in order
         */

        //Instantiate OneApollo helper class
        const oneApollo = new OneApollo();

        // Send request for unblock of health credits
        oneApollo.unblockHealthCredits({
          MobileNumber: orderDetails.patient.mobileNumber.slice(3),
          PointsToRelease: healthCreditsToRefund.toString(),
          StoreCode: getStoreCodeFromDevice(orderDetails.deviceType, orderDetails.bookingSource),
          BusinessUnit: process.env.ONEAPOLLO_BUSINESS_UNIT || '',
          RedemptionRequestNumber: healthCreditsRedemptionRequest.RequestNumber.toString(),
        });
      } else {
        log(
          'profileServiceLogger',
          `HEALTH_CREDITS_REDEMPTION_REQUEST_NOT_FOUND`,
          `HEALTH CREDITS REFUND FAILED - ${orderDetails.orderAutoId}`,
          JSON.stringify(paymentInfo),
          'true'
        );
      }
    }

    /**
     * Update information about updated healthCredits redeemed
     * and refundAmount in medicineOrderPayments
     */
    if (Object.keys(updatePaymentRequest).length) {
      medOrderRepo.updateMedicineOrderPayment(
        orderDetails.id,
        orderDetails.orderAutoId,
        updatePaymentRequest
      );
    }

    //send refund SMS notification for partial refund
    let isPartialRefund: boolean;
    if (totalOrderBilling > 0) {
      isPartialRefund = true;
    } else {
      isPartialRefund = false;
    }
    medicineOrderRefundNotification(
      orderDetails,
      {
        refundAmount: refundAmount,
        paymentInfo,
        healthCreditsRefunded: healthCreditsToRefund,
        isPartialRefund,
        reasonCode,
        isRefundSuccessful,
      },
      profilesDb
    );
  }
};

const genCheckSumPromiseWrapper = (body: PaytmBody, key: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    genchecksumbystring(JSON.stringify(body), key, (err: Error, result: string) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};
