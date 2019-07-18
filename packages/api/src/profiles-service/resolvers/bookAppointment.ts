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
    status: STATUS
  }

  type BookAppointmentResult {
    id: ID!
    message: String
  }

  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
  id: string;
  message: string;
};

type BookAppointmentInput = {
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
  const aptinput = appointmentInput;
  aptinput.status = STATUS.IN_PROGRESS;
  const appt = await Appointments.create(aptinput)
    .save()
    .catch((createErrors) => {
      throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
    });

  return { id: appt.id, message: 'Success' };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
