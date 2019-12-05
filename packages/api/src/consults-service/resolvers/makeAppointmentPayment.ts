import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { AppointmentPayments, STATUS, APPOINTMENT_PAYMENT_TYPE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const makeAppointmentPaymentTypeDefs = gql`
  enum APPOINTMENT_PAYMENT_TYPE {
    ONLINE
  }

  input AppointmentPaymentInput {
    appointmentId: ID!
    amountPaid: Float!
    paymentRefId: String
    paymentStatus: String!
    paymentDateTime: DateTime!
    responseCode: String!
    responseMessage: String!
    bankTxnId: String
    orderId: String
  }

  type AppointmentPayment {
    id: ID!
    amountPaid: Float!
    paymentRefId: String
    paymentStatus: String!
    paymentDateTime: DateTime!
    responseCode: String!
    responseMessage: String!
    bankTxnId: String!
    orderId: String!
  }

  type AppointmentPaymentResult {
    appointment: AppointmentPayment
  }

  extend type Mutation {
    makeAppointmentPayment(paymentInput: AppointmentPaymentInput): AppointmentPaymentResult!
  }
`;

type AppointmentPaymentResult = {
  appointment: AppointmentPayment;
};

type AppointmentPayment = {
  id: string;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  orderId: string;
};

type AppointmentPaymentInput = {
  appointmentId: string;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  orderId: string;
};

type AppointmentInputArgs = { paymentInput: AppointmentPaymentInput };

const makeAppointmentPayment: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  AppointmentPaymentResult
> = async (parent, { paymentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const processingAppointment = await apptsRepo.findByIdAndStatus(
    paymentInput.appointmentId,
    STATUS.PAYMENT_PENDING
  );
  if (!processingAppointment) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  //insert payment details
  const apptPaymentAttrs: Partial<AppointmentPayments> = paymentInput;
  apptPaymentAttrs.appointment = processingAppointment;
  apptPaymentAttrs.paymentType = APPOINTMENT_PAYMENT_TYPE.ONLINE;
  const paymentInfo = await apptsRepo.saveAppointmentPayment(apptPaymentAttrs);

  //update appointment status to PENDING
  if (paymentInput.paymentStatus == 'TXN_SUCCESS') {
    await apptsRepo.updateAppointmentStatus(paymentInput.appointmentId, STATUS.PENDING);
  }

  return { appointment: paymentInfo };
};

export const makeAppointmentPaymentResolvers = {
  Mutation: {
    makeAppointmentPayment,
  },
};
