import { Connection } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRefundsRepository } from 'consults-service/repositories/appointmentRefundsRepository';
import {
  REFUND_STATUS,
  PAYTM_STATUS,
  AppointmentRefunds,
  AppointmentPayments,
  Appointment,
  PAYMENT_METHODS,
} from 'consults-service/entities/index';

import { log } from 'customWinstonLogger';
import { genchecksumbystring } from 'lib/paytmLib/checksum.js';

type RefundInput = {
  refundAmount: number;
  txnId: string;
  paymentMode: string;
  orderId: string;
  appointment: Appointment;
  appointmentPayments: AppointmentPayments;
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
  consultsDb: Connection
) => {
  try {
    const appointmentRefRepo = consultsDb.getCustomRepository(AppointmentRefundsRepository);
    const saveRefundAttr: Partial<AppointmentRefunds> = refundInput;
    saveRefundAttr.refundStatus = REFUND_STATUS.REFUND_REQUEST_NOT_RAISED;
    const response = await appointmentRefRepo.saveRefundInfo(saveRefundAttr);
    let mid = process.env.MID_CONSULTS ? process.env.MID_CONSULTS : '';
    if (refundInput.paymentMode == PAYMENT_METHODS.SBIYONO)
      mid = process.env.SBI_MID_CONSULTS ? process.env.SBI_MID_CONSULTS : '';
    const paytmBody: PaytmBody = {
      mid,
      refId: response.refId,
      txnType: 'REFUND',
      txnId: refundInput.txnId,
      orderId: refundInput.orderId,
      refundAmount: '' + refundInput.refundAmount,
    };

    const checksumHash = await genCheckSumPromiseWrapper(
      paytmBody,
      process.env.PAYTM_MERCHANT_KEY_CONSULTS ? process.env.PAYTM_MERCHANT_KEY_CONSULTS : ''
    );
    const paytmParams: PaytmHeadBody = {
      head: {
        signature: checksumHash,
      },
      body: paytmBody,
    };
    log(
      'consultServiceLogger',
      'Paytm Request Body',
      'initiateRefund()',
      JSON.stringify(paytmParams),
      ''
    );
    const paytmResponse = await appointmentRefRepo.raiseRefundRequestWithPaytm(
      paytmParams,
      process.env.PAYTM_REFUND_URL ? process.env.PAYTM_REFUND_URL : ''
    );
    log(
      'consultServiceLogger',
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

    const refundObj: Partial<AppointmentRefunds> = {};

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
    await appointmentRefRepo.updateRefund(response.refId, refundObj);

    if (paytmResult.resultInfo) paytmResult.resultInfo.resultStatus = resultStatus;
    return paytmResult;
  } catch (e) {
    log('consultServiceLogger', JSON.stringify(refundInput), 'initiateRefund()', e.stack, 'true');
    throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, {});
  }
};

const genCheckSumPromiseWrapper = (body: PaytmBody, key: string) => {
  return new Promise((resolve, reject) => {
    genchecksumbystring(JSON.stringify(body), key, (err: Error, result: string) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};
