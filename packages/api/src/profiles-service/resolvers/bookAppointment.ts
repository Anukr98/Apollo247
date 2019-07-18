import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointments, STATUS } from 'profiles-service/entity/appointment';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { ProfilesServiceContext } from 'profiles-service/profiles-service';
export const bookAppointmentTypeDefs = gql`
  enum STATUS {
    IN_PROGRESS
    CONFIRMED
    CANCELLED
  }

  input BookAppointmentInput {
    patientId: String
    doctorId: String
    appointmentDate: Date
    appointmentTime: Time
    appointmentType: String
    hospitalId: String
    status: STATUS
  }

  type BookAppointmentResult {
    appointmentId: String
    message: String
  }

  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
  appointmentId: string;
  message: string;
};

type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: Time;
  appointmentType: string;
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

  return { appointmentId: appt.id, message: 'Success' };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
