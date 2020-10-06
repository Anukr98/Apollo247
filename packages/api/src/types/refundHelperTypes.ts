import { PAYTM_STATUS, Appointment, AppointmentPayments } from 'consults-service/entities';

export type RefundInput = {
  refundAmount: number;
  txnId: string;
  orderId: string;
  appointment: Appointment;
  appointmentPayments: AppointmentPayments;
};

export type ResultInfo = {
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

export interface PaytmBody {
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
