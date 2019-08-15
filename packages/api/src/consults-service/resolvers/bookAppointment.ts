import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointment, STATUS, APPOINTMENT_TYPE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const bookAppointmentTypeDefs = gql`
  enum STATUS {
    IN_PROGRESS
    CONFIRMED
    CANCELLED
    COMPLETED
    MISSED
  }

  enum APPOINTMENT_TYPE {
    ONLINE
    PHYSICAL
  }

  type AppointmentBooking {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
  }

  input BookAppointmentInput {
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
  }

  type BookAppointmentResult {
    appointment: AppointmentBooking
  }

  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
  appointment: Appointment;
};

type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
};

type AppointmentBooking = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
};

type AppointmentInputArgs = { appointmentInput: BookAppointmentInput };

const bookAppointment: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  BookAppointmentResult
> = async (parent, { appointmentInput }, { consultsDb, doctorsDb }) => {
  const appointmentAttrs: Omit<AppointmentBooking, 'id'> = {
    ...appointmentInput,
    status: STATUS.IN_PROGRESS,
  };

  //check if given appointment datetime is greater than current date time
  if (appointmentInput.appointmentDateTime <= new Date()) {
    throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  }

  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const apptCount = await appts.checkAppointmentIfExisit(
    appointmentInput.doctorId,
    appointmentInput.appointmentDateTime
  );
  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }
  const appointment = await appts.saveAppointment(appointmentAttrs);
  return { appointment };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
