import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointments, STATUS, APPOINTMENT_TYPE } from 'profiles-service/entity/appointment';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { ProfilesServiceContext } from 'profiles-service/profiles-service';
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

  input BookAppointmentInput {
    patientId: ID!
    doctorId: ID!
    appointmentDate: Date!
    appointmentTime: Time!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
  }

  type BookAppointmentResult {
    id: ID
    patientId: ID
    doctorId: ID
    appointmentDate: Date
    appointmentTime: Time
    appointmentType: APPOINTMENT_TYPE
    hospitalId: ID
    status: STATUS
  }

  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: Time;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
  status: STATUS;
};

type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: Time;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
};

type Appointment = {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: Time;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
  status: STATUS;
};

type AppointmentInputArgs = { appointmentInput: BookAppointmentInput };

const bookAppointment: Resolver<
  null,
  AppointmentInputArgs,
  ProfilesServiceContext,
  BookAppointmentResult
> = async (parent, { appointmentInput }) => {
  const appointmentAttrs: Appointment = {
    ...appointmentInput,
    status: STATUS.IN_PROGRESS,
  };
  return await Appointments.create(appointmentAttrs)
    .save()
    .catch((createErrors) => {
      throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
    });
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
