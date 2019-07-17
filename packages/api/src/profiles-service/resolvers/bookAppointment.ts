import gql from 'graphql-tag';
import { Resolver } from 'profiles-service/profiles-service';
import { Appointments, status } from 'profiles-service/entity/appointment';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';

export const bookAppointmentTypeDefs = gql`
  enum status {
    INPROGRESS
    CONFIRMED
    CANCELLED
  }

  input BookAppointmentInput {
    patientId: String
    doctorId: String
    appointmentDate: String
    appointmentTime: String
    appointmentType: String
    hospitalId: String
  }


  type BookAppointmentResult {
    appointmentId: String
    message: String
  }
r
  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
    appointmentId: String
    message: String
  }

type BookAppointmentInput = {appointmentInput: BookAppointmentInput}

const bookAppointment: Resolver<any> = async (
  parent,
  { appointmentInput }
): Promise<BookAppointmentResult> => {
  const aptinput = appointmentInput;
  aptinput.status = status.INPROGRESS;
  const appt = await Appointments.create(aptinput).save().catch((createErrors) => {
    throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
  });
  
  return {appointmentId:appt.id, message:'Success'}
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
