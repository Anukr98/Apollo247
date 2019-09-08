import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  Appointment,
  AppointmentPayments,
  STATUS,
  APPOINTMENT_PAYMENT_TYPE,
} from 'consults-service/entities';
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
  }

  type AppointmentPaymentResult {
    appointment: AppointmentBooking
  }

  extend type Mutation {
    makeAppointmentPayment(paymentInput: AppointmentPaymentInput): AppointmentPaymentResult!
  }
`;

type AppointmentPaymentResult = {
  appointment: Appointment;
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
    STATUS.PENDING
  );
  if (!processingAppointment) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  //insert payment details
  const apptPaymentAttrs: Partial<AppointmentPayments> = paymentInput;
  apptPaymentAttrs.appointment = processingAppointment;
  apptPaymentAttrs.paymentType = APPOINTMENT_PAYMENT_TYPE.ONLINE;
  await apptsRepo.saveAppointmentPayment(apptPaymentAttrs);

  //update appointment status to PENDING
  await apptsRepo.updateAppointmentStatus(paymentInput.appointmentId, STATUS.PENDING);

  return { appointment: processingAppointment };
};

export const makeAppointmentPaymentResolvers = {
  Mutation: {
    makeAppointmentPayment,
  },
};
