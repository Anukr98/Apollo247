import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
//import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
//import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const getNextOpenAppointmentTypeDefs = gql`
  input NextOpenAppointmentInput {
    doctorId: ID!
  }

  type NextOpenAppointmentResult {
    doctorId: ID!
    online: Date!
    physical: Date!
  }

  extend type Query {
    getNextOpenAppointment(
      NextOpenAppointmentInput: NextOpenAppointmentInput!
    ): NextOpenAppointmentInputResult!
  }
`;

type NextOpenAppointmentResult = {
  doctorId: string;
  online: Date;
  physical: Date;
};

type NextOpenAppointmentInput = {
  doctorId: string;
};

const getNextOpenAppointment: Resolver<
  null,
  NextOpenAppointmentInput,
  ConsultServiceContext,
  NextOpenAppointmentResult
> = async (parent, { doctorId }, { doctorsDb, consultsDb }) => {
  // const consultHours = await doctorsDb
  //   .getCustomRepository(DoctorConsultHoursRepository)
  //   .getConsultHours(doctorId);

  // const { ONLINE, PHYSICAL } = await consultsDb
  //   .getCustomRepository(AppointmentRepository)
  //   .findNextOpenAppointment(doctorId, consultHours);

  return {
    doctorId,
    online: new Date(),
    physical: new Date(),
  };
};

export const getNextAvailabilityResolvers = {
  Query: {
    getNextOpenAppointment,
  },
};
