import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import { REFUND_STATUS, STATUS } from 'consults-service/entities';

export const paymentTransactionStatusTypeDefs = gql`
  enum REFUND_STATUS {
    REFUND_REQUEST_RAISED
    REFUND_FAILED
    REFUND_SUCCESSFUL
    REFUND_REQUEST_NOT_RAISED
  }
  type AppointmentPaymentResponse {
    appointment: AppointmentPaymentDetails
  }
  type AppointmentPaymentDetails {
    paymentRefId: String
    bankTxnId: String
    amountPaid: Float
    paymentStatus: String
    responseCode: Int
    responseMessage: String
    paymentDateTime: DateTime
    displayId: Int
    paymentMode: String
    refundStatus: REFUND_STATUS
    refundId: String
    refundAmount: Int
  }
  extend type Query {
    paymentTransactionStatus(appointmentId: String): AppointmentPaymentResponse
  }
`;

type AppointmentPaymentResponse = {
  appointment: AppointmentPaymentDetails;
};

type AppointmentPaymentDetails = {
  paymentRefId: string;
  bankTxnId: string;
  amountPaid: number;
  paymentStatus: string;
  responseCode: string;
  responseMessage: string;
  paymentDateTime: Date | null;
  displayId: number;
  paymentMode: string;
  refundStatus: REFUND_STATUS;
  refundId: String;
  refundAmount: number;
};

type RefundDetails = {
  refundStatus: REFUND_STATUS;
  refundId: String;
  refundAmount: number;
};

const paymentTransactionStatus: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  AppointmentPaymentResponse
> = async (parent, args, { consultsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);

  const response = await apptsRepo.findAppointmentPaymentById(args.appointmentId);

  if (!response) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  log(
    'consultServiceLogger',
    'consult payment response',
    'paymentTransactionStatus()',
    `The response received: ${JSON.stringify(response)}`,
    'true'
  );

  const appointmentPaymentsResponse =
    response.appointmentPayments && response.appointmentPayments[0]
      ? response.appointmentPayments[0]
      : null;
  const appointmentRefundsResponse = response.appointmentRefunds;
  const refundData: Partial<RefundDetails> = {};

  if (appointmentRefundsResponse) {
    appointmentRefundsResponse.forEach((val) => {
      if (val.refundStatus !== REFUND_STATUS.REFUND_REQUEST_NOT_RAISED) {
        if (refundData.refundAmount) refundData.refundAmount += val.refundAmount;
        else refundData.refundAmount = val.refundAmount;
        refundData.refundId = val.refundId;
        refundData.refundStatus = val.refundStatus;
      }
    });
  }
  const returnResponse: AppointmentPaymentDetails = {
    displayId: response.displayId,
    paymentStatus: response.status,
    bankTxnId: appointmentPaymentsResponse ? appointmentPaymentsResponse.bankTxnId : '',
    paymentRefId: appointmentPaymentsResponse ? appointmentPaymentsResponse.paymentRefId : '',
    responseMessage: appointmentPaymentsResponse ? appointmentPaymentsResponse.responseMessage : '',
    amountPaid: appointmentPaymentsResponse ? appointmentPaymentsResponse.amountPaid : 0,
    responseCode: appointmentPaymentsResponse ? appointmentPaymentsResponse.responseCode : '',
    paymentDateTime: appointmentPaymentsResponse
      ? appointmentPaymentsResponse.paymentDateTime
      : null,
    paymentMode: appointmentPaymentsResponse ? appointmentPaymentsResponse.paymentMode : '',
    refundAmount: refundData.refundAmount ? refundData.refundAmount : 0,
    refundId: refundData.refundId ? refundData.refundId : '',
    refundStatus: refundData.refundStatus
      ? refundData.refundStatus
      : REFUND_STATUS.REFUND_REQUEST_NOT_RAISED,
  };

  if (appointmentPaymentsResponse) {
    switch (appointmentPaymentsResponse.paymentStatus) {
      case 'TXN_SUCCESS':
        returnResponse.paymentStatus = 'PAYMENT_SUCCESS';
        break;
      case 'PENDING':
        returnResponse.paymentStatus = 'PAYMENT_PENDING_PG';
        break;
      case 'TXN_FAILURE':
        returnResponse.paymentStatus = 'PAYMENT_FAILED';
        if (response.status === STATUS.PAYMENT_ABORTED) {
          returnResponse.paymentStatus = STATUS.PAYMENT_ABORTED;
        }
        break;
    }
  }

  return { appointment: returnResponse };
};

export const paymentTransactionStatusResolvers = {
  Query: {
    paymentTransactionStatus,
  },
};
