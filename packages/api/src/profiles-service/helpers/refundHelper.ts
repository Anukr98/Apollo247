import { Connection } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { MedicineOrderRefundsRepository } from 'profiles-service/repositories/MedicineOrderRefundsRepository';
//to avoid code duplication...
import { genchecksumbystring } from 'lib/paytmLib/checksum.js';
import { PAYTM_STATUS, REFUND_STATUS } from 'profiles-service/entities';

import {
  MedicineOrderRefunds,
  MedicineOrderPayments,
  MedicineOrders,
} from 'profiles-service/entities/index';

import { log } from 'customWinstonLogger';

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

    const paytmBody: PaytmBody = {
      mid: process.env.MID_PHARMACY ? process.env.MID_PHARMACY : '',
      refId: response.refId,
      txnType: 'REFUND',
      txnId: refundInput.txnId,
      orderId: refundInput.orderId,
      refundAmount: '' + refundInput.refundAmount,
    };

    const checksumHash: string = await genCheckSumPromiseWrapper(
      paytmBody,
      process.env.PAYTM_MERCHANT_KEY_PHARMACY ? process.env.PAYTM_MERCHANT_KEY_PHARMACY : ''
    );
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
