import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointments, STATUS, APPOINTMENT_TYPE } from 'profiles-service/entity/appointment';
import { ProfilesServiceContext } from 'profiles-service/profiles-service';

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
    appointmentsHistory: [AppointmentHistory]
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
  appointmentTime: Time;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
  bookingDate: DateTime;
};

type AppointmentInputArgs = { appointmentHistoryInput: AppointmentHistoryInput };

const getAppointmentHistory: Resolver<
  null,
  AppointmentInputArgs,
  ProfilesServiceContext,
  AppointmentResult
> = async (parent, { appointmentHistoryInput }) => {
  const appointmentsHistory = await Appointments.find({
    where: {
      doctorId: appointmentHistoryInput.doctorId,
      patientId: appointmentHistoryInput.patientId,
    },
  });
  console.log(appointmentsHistory);
  return { appointmentsHistory };
};

export const getAppointmentHistoryResolvers = {
  Query: {
    getAppointmentHistory,
  },
};
