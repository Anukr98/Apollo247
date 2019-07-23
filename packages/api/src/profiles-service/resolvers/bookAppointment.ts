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

  type Appointment {
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
    appointment: Appointment
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

type Appointment = {
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
  ProfilesServiceContext,
  BookAppointmentResult
> = async (parent, { appointmentInput }) => {
  const appointmentAttrs: Omit<Appointment, 'id'> = {
    ...appointmentInput,
    status: STATUS.IN_PROGRESS,
  };
  const appointment = await Appointments.create(appointmentAttrs)
    .save()
    .catch((createErrors) => {
      throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
    });
  return { appointment };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
