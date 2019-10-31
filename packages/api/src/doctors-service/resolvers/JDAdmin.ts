import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorType, Doctor } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';

export const JDTypeDefs = gql`
  type QueuedConsults {
    doctorid: String
    queuedconsultscount: Int
  }

  type DashoardData {
    consultsBookedButNotInQueue: Int
    juniorDoctorDetails: [Profile]
    juniorDoctorQueueItems: [QueuedConsults]
  }

  extend type Query {
    getJuniorDoctorDashboard(fromDate: Date, toDate: Date): DashoardData
  }
`;

type QueuedConsults = {
  doctorid: string;
  queuedconsultscount: number;
};

type DashoardData = {
  consultsBookedButNotInQueue: number;
  juniorDoctorDetails: Doctor[];
  juniorDoctorQueueItems: QueuedConsults[];
};
const getJuniorDoctorDashboard: Resolver<
  null,
  { fromDate: Date; toDate: Date },
  DoctorsServiceContext,
  DashoardData
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  if (args.fromDate > args.toDate) throw new AphError(AphErrorMessages.INVALID_DATES);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.searchDoctorByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  if (doctordata.doctorType !== DoctorType.ADMIN) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  let consultsBookedButNotInQueue = 0;
  let juniorDoctorQueueItems: QueuedConsults[] = [];

  //get appointments
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.getAllAppointmentsWithOutLimit(
    args.fromDate,
    args.toDate
  );
  const queueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
  if (appointmentData != null) {
    const appointmentIds = appointmentData.map((appointment) => {
      return appointment.id;
    });

    const queueItems = await queueRepo.getQueueItemsByAppointmentId(appointmentIds);
    consultsBookedButNotInQueue = appointmentIds.length - queueItems.length;
  }

  //get junior doctor details
  const juniorDoctorDetails = await doctorRepository.getJuniorDoctorsList();
  if (juniorDoctorDetails != null) {
    const juniorDoctorIds = juniorDoctorDetails.map((doctor) => {
      return doctor.id;
    });

    //get Queue Items of junior doctors
    juniorDoctorQueueItems = await queueRepo.getJuniorDoctorQueueCount(
      juniorDoctorIds,
      args.fromDate,
      args.toDate
    );
  }

  const DashoardData: DashoardData = {
    consultsBookedButNotInQueue: consultsBookedButNotInQueue,
    juniorDoctorDetails: juniorDoctorDetails,
    juniorDoctorQueueItems: juniorDoctorQueueItems,
  };

  return DashoardData;
};

export const JDResolvers = {
  Query: {
    getJuniorDoctorDashboard,
  },
};
