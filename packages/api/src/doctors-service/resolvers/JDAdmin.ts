import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorType } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const JDTypeDefs = gql`
  extend type Query {
    getJuniorDoctorDashboard: String
  }
`;

const getJuniorDoctorDashboard: Resolver<null, {}, DoctorsServiceContext, string> = async (
  parent,
  args,
  { mobileNumber, doctorsDb, consultsDb }
) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.searchDoctorByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  if (doctordata.doctorType !== DoctorType.ADMIN) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  const fromDate = new Date('2019-10-01');
  const toDate = new Date('2019-10-31');

  //get appointments
  const consultRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await consultRepo.getAllAppointmentsWithOutLimit(fromDate, toDate);
  if (appointmentData != null) {
    const appointmentIds = appointmentData.filter((appointment) => {
      return appointment.id;
    });

    console.log(appointmentIds);
  }

  const dashboardData = { appointmnetsNotInQueue: 0 };

  return '';
};

export const JDResolvers = {
  Query: {
    getJuniorDoctorDashboard,
  },
};
