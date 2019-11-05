import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, AdminType } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
import { AdminUser } from 'doctors-service/repositories/adminRepository';
import { Connection } from 'typeorm';

export const JDTypeDefs = gql`
  type QueuedConsults {
    doctorid: String
    queuedconsultscount: Int
  }

  type DashboardData {
    consultsBookedButNotInQueue: Int
    juniorDoctorDetails: [Profile]
    juniorDoctorQueueItems: [QueuedConsults]
  }

  extend type Query {
    getJuniorDoctorDashboard(fromDate: Date, toDate: Date, offset: Int, limit: Int): DashboardData
  }
`;

type QueuedConsults = {
  doctorid: string;
  queuedconsultscount: number;
};

export type DashboardData = {
  consultsBookedButNotInQueue: number;
  juniorDoctorDetails: Doctor[];
  juniorDoctorQueueItems: QueuedConsults[];
};
const getJuniorDoctorDashboard: Resolver<
  null,
  { fromDate: Date; toDate: Date; offset: number; limit: number },
  DoctorsServiceContext,
  DashboardData
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  if (args.fromDate > args.toDate) throw new AphError(AphErrorMessages.INVALID_DATES);

  const adminRepository = doctorsDb.getCustomRepository(AdminUser);
  const adminData = await adminRepository.checkValidAccess(mobileNumber, true);
  if (adminData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  if (adminData.userType !== AdminType.JDADMIN) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  return getJuniorDoctorsDashboard(
    args.fromDate,
    args.toDate,
    args.offset,
    args.limit,
    doctorsDb,
    consultsDb
  );
};

export const getJuniorDoctorsDashboard = async (
  fromDate: Date,
  toDate: Date,
  offset: number,
  limit: number,
  doctorsDb: Connection,
  consultsDb: Connection
) => {
  if (fromDate > toDate) throw new AphError(AphErrorMessages.INVALID_DATES);

  let consultsBookedButNotInQueue = 0;
  let juniorDoctorQueueItems: QueuedConsults[] = [];

  //get appointments
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.getAllAppointmentsWithOutLimit(fromDate, toDate);
  const queueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
  if (appointmentData != null) {
    const appointmentIds = appointmentData.map((appointment) => {
      return appointment.id;
    });

    const queueItems = await queueRepo.getQueueItemsByAppointmentId(appointmentIds);
    consultsBookedButNotInQueue = appointmentIds.length - queueItems.length;
  }

  //get junior doctor details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const juniorDoctorDetails = await doctorRepository.getJuniorDoctorsList(offset, limit);
  if (juniorDoctorDetails != null) {
    const juniorDoctorIds = juniorDoctorDetails.map((doctor) => {
      return doctor.id;
    });

    if (juniorDoctorIds.length > 0) {
      //get Queue Items of junior doctors
      juniorDoctorQueueItems = await queueRepo.getJuniorDoctorQueueCount(
        juniorDoctorIds,
        fromDate,
        toDate
      );
    }
  }

  const DashboardData: DashboardData = {
    consultsBookedButNotInQueue: consultsBookedButNotInQueue,
    juniorDoctorDetails: juniorDoctorDetails,
    juniorDoctorQueueItems: juniorDoctorQueueItems,
  };

  return DashboardData;
};

export const JDResolvers = {
  Query: {
    getJuniorDoctorDashboard,
  },
};
