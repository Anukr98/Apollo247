import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorType } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';

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
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.getAllAppointmentsWithOutLimit(fromDate, toDate);
  const queueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
  if (appointmentData != null) {
    const appointmentIds = appointmentData.map((appointment) => {
      return appointment.id;
    });

    console.log(appointmentIds);

    const queueItems = await queueRepo.getQueueItemsByAppointmentId(appointmentIds);
    console.log(queueItems);

    console.log('not in Queue', appointmentIds.length - queueItems.length);
  }

  //get junior doctor details
  const juniorDoctorDetails = await doctorRepository.getJuniorDoctorsList();
  if (juniorDoctorDetails != null) {
    const juniorDoctorIds = juniorDoctorDetails.map((doctor) => {
      return doctor.id;
    });

    console.log(juniorDoctorIds);

    //get Queue Items of junior doctors
    const juniorDoctorQueueItems = await queueRepo.getJuniorDoctorQueueCount(juniorDoctorIds);
    console.log('juniorDoctorQueueItems', juniorDoctorQueueItems);
  }

  const dashboardData = { appointmnetsNotInQueue: 0 };

  return '';
};

export const JDResolvers = {
  Query: {
    getJuniorDoctorDashboard,
  },
};
