import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointment, STATUS, APPOINTMENT_TYPE } from 'consults-service/entities/appointment';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { getConnection } from 'typeorm';

export const bookAppointmentTypeDefs = gql`
  enum STATUS {
    IN_PROGRESS
    CONFIRMED
    CANCELLED
  }

  enum APPOINTMENT_TYPE {
    ONLINE
    PHYSICAL
  }

  type AppointmentBooking {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDate: Date!
    appointmentTime: Time!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
  }

  input BookAppointmentInput {
    patientId: ID!
    doctorId: ID!
    appointmentDate: Date!
    appointmentTime: Time!
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
  appointmentDate: Date;
  appointmentTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
};

type AppointmentBooking = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: Date;
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
> = async (parent, { appointmentInput }, { doctorsDbConnect }) => {
  const appointmentAttrs: Omit<AppointmentBooking, 'id'> = {
    ...appointmentInput,
    status: STATUS.IN_PROGRESS,
  };
  const con = getConnection();
  const appts = con.getCustomRepository(AppointmentRepository);
  const appointment = await appts.saveAppointment(appointmentAttrs);
  return { appointment };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
