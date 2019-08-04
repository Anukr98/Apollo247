import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointment, STATUS, APPOINTMENT_TYPE } from 'consults-service/entities/appointment';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const getAppointmentHistoryTypeDefs = gql`
  type AppointmentHistory {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDate: Date!
    appointmentTime: Time!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
    bookingDate: DateTime
  }

  input AppointmentHistoryInput {
    patientId: ID!
    doctorId: ID!
  }

  type AppointmentResult {
    appointmentsHistory: [AppointmentHistory!]
  }

  extend type Query {
    getAppointmentHistory(appointmentHistoryInput: AppointmentHistoryInput): AppointmentResult!
  }
`;

type AppointmentResult = {
  appointmentsHistory: AppointmentHistory[] | null;
};

type AppointmentHistoryInput = {
  patientId: string;
  doctorId: string;
};

type AppointmentHistory = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
  bookingDate: Date;
};

type AppointmentInputArgs = { appointmentHistoryInput: AppointmentHistoryInput };

const getAppointmentHistory: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  AppointmentResult
> = async (parent, { appointmentHistoryInput }, { consultsDbConnect, doctorsDbConnect }) => {
  const appts = consultsDbConnect.getCustomRepository(AppointmentRepository);
  const appointmentsHistory = await appts.getPatientAppointments(
    appointmentHistoryInput.doctorId,
    appointmentHistoryInput.patientId
  );
  return { appointmentsHistory };
};

export const getAppointmentHistoryResolvers = {
  Query: {
    getAppointmentHistory,
  },
};
