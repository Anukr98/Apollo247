import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { CaseSheet, Appointment, APPOINTMENT_TYPE, STATUS } from 'consults-service/entities';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Patient } from 'profiles-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { ApiConstants } from 'ApiConstants';
import { NotificationBinRepository } from 'notifications-service/repositories/notificationBinRepository';

export type DiagnosisJson = {
  name: string;
  id: string;
};

export type DiagnosticJson = {
  itemid: string;
  itemname: string;
  itemcode: string;
  ItemAliasName: string;
  FromAgeInDays: number;
  ToAgeInDays: number;
  Gender: string;
  LabName: string;
  LabCode: string;
  LabID: number;
  Rate: number;
  ScheduleRate: number;
  FromDate: string;
  ToDate: string;
  ItemType: string;
  TestInPackage: number;
  NABL_CAP: string;
  ItemRemarks: string;
  Discounted: string;
};

export type Vitals = {
  bp: string;
  temperature: string;
  height: string;
  weight: string;
};

export const caseSheetV2TypeDefs = gql`
  type CaseSheetDetails {
    caseSheetDetails: CaseSheet
    patientDetails: PatientDetails
    pastAppointments: [Appointment]
    juniorDoctorNotes: String
    juniorDoctorCaseSheet: CaseSheet
    allowedDosages: [String]
  }

  type pastAppointments {
    pastAppointments: [Appointment]
  }

  extend type Query {
    caseSheet(appointmentId: String): CaseSheetDetails
    pastAppointmentsWithCompletedCaseSheet(appointmentId: String,unreadMessagesCount: Boolean): pastAppointments
  }
`;

type AppointmentDocuments = {
  documentPath: string;
  prismFileId: string;
};

type AppointmentDetails = {
  id: string;
  appointmentDateTime: Date;
  appointmentDocuments: AppointmentDocuments[];
  appointmentState: string;
  appointmentType: APPOINTMENT_TYPE;
  displayId: number;
  doctorId: string;
  hospitalId: string;
  patientId: string;
  parentId: string;
  status: STATUS;
  rescheduleCount: number;
  rescheduleCountByDoctor: number;
  isFollowUp: Boolean;
  followUpParentId: string;
  isTransfer: Boolean;
  transferParentId: string;
  caseSheet: CaseSheet[];
  sdConsultationDate: Date;
  unreadMessagesCount: number;
};

const caseSheet: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  {
    caseSheetDetails: CaseSheet;
    patientDetails: Patient;
    juniorDoctorCaseSheet: CaseSheet;
    allowedDosages: string[];
  }
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetailsForConsult(appointmentData.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //get loggedin user details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findOne(appointmentData.doctorId);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  if (doctorData.mobileNumber != mobileNumber && patientDetails.mobileNumber != mobileNumber)
    throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const { SDCaseSheet, JDCaseSheet } = await caseSheetRepo.getCaseSheetByFilters(
    appointmentData.id
  );
  if (SDCaseSheet == null || SDCaseSheet.length < 1)
    throw new AphError(AphErrorMessages.NO_CASESHEET_EXIST);
  if (JDCaseSheet == null || JDCaseSheet.length < 1)
    throw new AphError(AphErrorMessages.JUNIOR_DOCTOR_CASESHEET_NOT_CREATED);

  const caseSheetDetails = SDCaseSheet[0];
  const juniorDoctorCaseSheet = JDCaseSheet[0];
  console.log('JDCaseSheet', JDCaseSheet);
  console.log('SDCaseSheet', SDCaseSheet);

  return {
    caseSheetDetails,
    patientDetails,
    juniorDoctorCaseSheet,
    allowedDosages: ApiConstants.ALLOWED_DOSAGES.split(','),
  };
};

const pastAppointmentsWithCompletedCaseSheet: Resolver<
  null,
  { appointmentId: string; unreadMessagesCount?: boolean },
  ConsultServiceContext,
  {
    pastAppointments: AppointmentDetails[];
  }
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  const unreadMessagesCount = args.unreadMessagesCount;
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointmentData.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientDetails });

  ////doctor validation
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findOne(appointmentData.doctorId);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  if (doctorData.mobileNumber != mobileNumber && patientDetails.mobileNumber != mobileNumber)
    throw new AphError(AphErrorMessages.UNAUTHORIZED);
  //get past appointment details
  const pastAppointments = await appointmentRepo.getPastAppointments(
    '65b8ce4a-6285-4bc7-840c-972a98c6df2c', // doctorData.id
    primaryPatientIds
  );

  const pastAppointmentsWithCompletedCaseSheet = pastAppointments.map((appointment) => {
    appointment.caseSheet = appointment.caseSheet.filter((caseSheet) => {
      if (caseSheet.sentToPatient) caseSheet; //caseSheet.doctorType != 'JUNIOR' &&
    });
    return appointment;
  });

  let pastAppointmentsWithUnreadMessages: AppointmentDetails[] = [];
  if (pastAppointmentsWithCompletedCaseSheet.length) {
    const appointmentIds: string[] = [];
    const appointmentMessagesCount: { [key: string]: number } = {};
    if (unreadMessagesCount) {
      pastAppointmentsWithCompletedCaseSheet.map((appointment) => {
        appointmentMessagesCount[appointment.id] = 0;
        appointmentIds.push(appointment.id);
      });

      //Getting all the notifications with appointment ids
      const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
      const notifications = await notificationBinRepo.getRequiredFieldsByAppointmentIds(
        appointmentIds,
        ['notificationBin.eventId']
      );

      //Mapping the count of messages with appointment ids
      notifications.map((notification) => {
        if (appointmentMessagesCount[notification.eventId] != undefined) {
          appointmentMessagesCount[notification.eventId]++;
        }
      });
    }
    pastAppointmentsWithUnreadMessages = pastAppointmentsWithCompletedCaseSheet.map(
      (appointment) => {
        return {
          ...appointment,
          unreadMessagesCount: unreadMessagesCount ? appointmentMessagesCount[appointment.id] : 0,
        };
      }
    );
  }
  return {
    pastAppointments: pastAppointmentsWithUnreadMessages,
  };
};

export const caseSheetV2Resolvers = {
  Appointment: {
    doctorInfo(appointments: Appointment) {
      return { __typename: 'Profile', id: appointments.doctorId };
    },
  },
  CaseSheet: {
    createdDoctorProfile(caseSheet: CaseSheet) {
      return { __typename: 'Profile', id: caseSheet.createdDoctorId };
    },
    patientDetails(caseSheet: CaseSheet) {
      return { __typename: 'PatientFullDetails', id: caseSheet.patientId };
    },
  },

  Query: {
    pastAppointmentsWithCompletedCaseSheet,
    caseSheet,
  },
};
