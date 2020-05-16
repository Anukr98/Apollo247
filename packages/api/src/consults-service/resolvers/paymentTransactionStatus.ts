import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';

export const paymentTransactionStatusTypeDefs = gql`
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
};

const paymentTransactionStatus: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  AppointmentPaymentResponse
> = async (parent, args, { consultsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);

  const response = await apptsRepo.findAppointmentPaymentById(args.appointmentId);
  log(
    'consultServiceLogger',
    'payload received',
    'paymentTransactionStatus()',
    `The response received: ${JSON.stringify(response)}`,
    'true'
  );

  if (!response) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  const appointmentPaymentsResponse =
    response.appointmentPayments && response.appointmentPayments[0]
      ? response.appointmentPayments[0]
      : null;
  const returnResponse: AppointmentPaymentDetails = {
    displayId: response.displayId,
    paymentStatus: response.status,
    bankTxnId: appointmentPaymentsResponse ? appointmentPaymentsResponse.bankTxnId : '',
    paymentRefId: appointmentPaymentsResponse ? appointmentPaymentsResponse.bankTxnId : '',
    responseMessage: appointmentPaymentsResponse ? appointmentPaymentsResponse.responseMessage : '',
    amountPaid: appointmentPaymentsResponse ? appointmentPaymentsResponse.amountPaid : 0,
    responseCode: appointmentPaymentsResponse ? appointmentPaymentsResponse.bankTxnId : '',
    paymentDateTime: appointmentPaymentsResponse
      ? appointmentPaymentsResponse.paymentDateTime
      : null,
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
