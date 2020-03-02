import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import {
  SdDashboardSummary,
  FeedbackDashboardSummary,
  PhrDocumentsSummary,
  DoctorFeeSummary,
  TRANSFER_INITIATED_TYPE,
  PATIENT_TYPE,
} from 'consults-service/entities';
import { ConsultMode, WeekDay } from 'doctors-service/entities';
import { FEEDBACKTYPE } from 'profiles-service/entities';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  SdDashboardSummaryRepository,
  CurrentAvailStatusRepository,
  UtilizationCapacityRepository,
} from 'consults-service/repositories/sdDashboardSummaryRepository';
import { PatientFeedbackRepository } from 'profiles-service/repositories/patientFeedbackRepository';
import { PatientHelpTicketRepository } from 'profiles-service/repositories/patientHelpTicketsRepository';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { AdminDoctorMap } from 'doctors-service/repositories/adminDoctorRepository';
import { LoginHistoryRepository } from 'doctors-service/repositories/loginSessionRepository';
import _isEmpty from 'lodash/isEmpty';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { format, differenceInMinutes } from 'date-fns';
import { ApiConstants } from 'ApiConstants';

export const sdDashboardSummaryTypeDefs = gql`
  type DashboardSummaryResult {
    doctorId: String
    doctorName: String
    appointmentDateTime: Date
    totalConsultation: Int
  }

  enum PATIENT_TYPE {
    NEW
    REPEAT
  }

  type UpdatePatientTypeResult {
    status: Boolean
  }

  type FeedbackSummaryResult {
    ratingRowsCount: Int
  }

  type DocumentSummaryResult {
    apptDocCount: Int
    medDocCount: Int
  }

  type DoctorFeeSummaryResult {
    status: Boolean
  }

  type GetopenTokFileUrlResult {
    urls: [String]
  }
  type updateSpecialtyCountResult {
    updated: Boolean
  }
  type updateUtilizationCapacityResult {
    updated: Boolean
  }
  enum WeekDay {
    SUNDAY
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
  }
  extend type Mutation {
    updateSdSummary(summaryDate: Date, doctorId: String): DashboardSummaryResult!
    updateDoctorFeeSummary(summaryDate: Date, doctorId: String): DoctorFeeSummaryResult!
    updateConsultRating(summaryDate: Date): FeedbackSummaryResult
    updatePatientType(doctorId: ID!): UpdatePatientTypeResult
    updatePhrDocSummary(summaryDate: Date): DocumentSummaryResult
    updateSpecialtyCount(specialityId: String): updateSpecialtyCountResult
    updateUtilizationCapacity(
      specialityId: String
      weekDay: WeekDay
    ): updateUtilizationCapacityResult
  }

  extend type Query {
    getopenTokFileUrl(appointmentId: String): GetopenTokFileUrlResult
  }
`;

type DashboardSummaryResult = {
  doctorId: string;
  doctorName: string;
  appointmentDateTime: Date;
  totalConsultation: number;
};

type UpdatePatientTypeResult = {
  status: boolean;
};
type DoctorFeeSummaryResult = {
  status: boolean;
};

type GetopenTokFileUrlResult = {
  urls: string[];
};

type FeedbackSummaryResult = {
  ratingRowsCount: number;
};

type DocumentSummaryResult = {
  apptDocCount: number;
  medDocCount: number;
};

type FeedbackCounts = {
  rating: string;
  ratingcount: number;
};
type updateSpecialtyCountResult = {
  updated: Boolean;
};
type updateUtilizationCapacityResult = {
  updated: Boolean;
};
const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  dashboardRepo: consultsDb.getCustomRepository(SdDashboardSummaryRepository),
  feedbackRepo: patientsDb.getCustomRepository(PatientFeedbackRepository),
  helpTicketRepo: patientsDb.getCustomRepository(PatientHelpTicketRepository),
  medOrderRepo: patientsDb.getCustomRepository(MedicineOrdersRepository),
  adminMapRepo: doctorsDb.getCustomRepository(AdminDoctorMap),
  medRecordRepo: patientsDb.getCustomRepository(MedicalRecordsRepository),
  loginSessionRepo: doctorsDb.getCustomRepository(LoginHistoryRepository),
  DoctorSpecialtyRepo: doctorsDb.getCustomRepository(DoctorSpecialtyRepository),
  CurrentAvailStatusRepo: consultsDb.getCustomRepository(CurrentAvailStatusRepository),
  UtilizationCapacityRepo: consultsDb.getCustomRepository(UtilizationCapacityRepository),
  consultHoursRepo: doctorsDb.getCustomRepository(DoctorConsultHoursRepository),
});

const updateConsultRating: Resolver<
  null,
  { summaryDate: Date },
  ConsultServiceContext,
  FeedbackSummaryResult
> = async (parent, args, context) => {
  const { feedbackRepo, dashboardRepo, helpTicketRepo } = getRepos(context);
  const feedbackData: FeedbackCounts[] = await feedbackRepo.getFeedbackByDate(
    args.summaryDate,
    FEEDBACKTYPE.CONSULT
  );
  let goodRating = 0,
    okRating = 0,
    poorRating = 0,
    greatRating = 0;
  console.log(feedbackData, 'feedback data');
  if (feedbackData.length > 0) {
    feedbackData.forEach((record) => {
      console.log(record, 'record');
      console.log(record.rating, record.ratingcount, 'rating');
      if (record.rating == 'GOOD') {
        goodRating = record.ratingcount;
      } else if (record.rating == 'OKAY') {
        okRating = record.ratingcount;
      } else if (record.rating == 'GREAT') {
        greatRating = record.ratingcount;
      } else if (record.rating == 'POOR') {
        poorRating = record.ratingcount;
      }
    });
    const helpTicketCount = await helpTicketRepo.getHelpTicketCount(args.summaryDate);
    const feedbackAttrs: Partial<FeedbackDashboardSummary> = {
      ratingDate: args.summaryDate,
      goodRating,
      noRating: 0,
      poorRating,
      greatRating,
      okRating,
      helpTickets: helpTicketCount,
    };

    console.log('helpTicketCount', helpTicketCount);
    await dashboardRepo.saveFeedbackDetails(feedbackAttrs);
  }
  return { ratingRowsCount: feedbackData.length };
};
const updatePhrDocSummary: Resolver<
  null,
  { summaryDate: Date },
  ConsultServiceContext,
  DocumentSummaryResult
> = async (parent, args, context) => {
  const { dashboardRepo, medOrderRepo, medRecordRepo } = getRepos(context);
  const docCount = await dashboardRepo.getDocumentSummary(args.summaryDate);
  const prescritionCount = await medOrderRepo.getPrescriptionsCount(args.summaryDate);
  const standAloneDoc = await medRecordRepo.getRecordSummary(args.summaryDate);
  const phrDocAttrs: Partial<PhrDocumentsSummary> = {
    documentDate: args.summaryDate,
    appointmentDoc: docCount,
    medicineOrderDoc: prescritionCount,
    standAloneDoc,
  };
  await dashboardRepo.saveDocumentSummary(phrDocAttrs);
  return { apptDocCount: docCount, medDocCount: prescritionCount };
};

const updatePatientType: Resolver<
  null,
  { doctorId: string; patientId: string },
  ConsultServiceContext,
  UpdatePatientTypeResult
> = async (parent, args, context) => {
  const { apptRepo, docRepo } = getRepos(context);
  let prevPatientId = '0';

  const doctorData = await docRepo.findById(args.doctorId);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const appointmentDetails = await apptRepo.getAppointmentsByDocId(args.doctorId);
  if (appointmentDetails.length) {
    appointmentDetails.forEach(async (appointmentData) => {
      if (appointmentData.patientId != prevPatientId) {
        prevPatientId = appointmentData.patientId;
        await apptRepo.updatePatientType(appointmentData, PATIENT_TYPE.NEW);
      } else {
        await apptRepo.updatePatientType(appointmentData, PATIENT_TYPE.REPEAT);
      }
    });
  }
  return { status: true };
};

const updateSdSummary: Resolver<
  null,
  { summaryDate: Date; doctorId: string },
  ConsultServiceContext,
  DashboardSummaryResult
> = async (parent, args, context) => {
  const { docRepo, dashboardRepo, adminMapRepo, loginSessionRepo, consultHoursRepo } = getRepos(
    context
  );
  const docsList = await docRepo.getAllDoctors(args.doctorId);
  if (docsList.length > 0) {
    docsList.map(async (doctor) => {
      const loginSessionData = await loginSessionRepo.getLoginDetailsByDocId(
        doctor.id,
        args.summaryDate
      );
      let loggedInHours = 0,
        awayHours = 0;
      if (loginSessionData) {
        loggedInHours = parseFloat((loginSessionData.onlineTimeInSeconds / 60 / 60).toFixed(2));
        awayHours = parseFloat((loginSessionData.offlineTimeInSeconds / 60 / 60).toFixed(2));
      }
      const weekDay = format(args.summaryDate, 'EEEE').toUpperCase();
      const timeSlots = await consultHoursRepo.getConsultHours(doctor.id, weekDay);
      let difference = 0;
      let totalSlotsTime = 0;
      if (timeSlots.length) {
        timeSlots.forEach(async (timeSlot) => {
          difference += differenceInMinutes(
            new Date(ApiConstants.SAMPLE_DATE + timeSlot.endTime),
            new Date(ApiConstants.SAMPLE_DATE + timeSlot.startTime)
          );
        });
        totalSlotsTime = difference / timeSlots[0].consultDuration;
      }

      const totalConsultations = await dashboardRepo.getAppointmentsByDoctorId(
        doctor.id,
        args.summaryDate,
        'BOTH'
      );
      const totalConsultationTime = await dashboardRepo.getTotalConsultationTime(
        args.summaryDate,
        doctor.id,
        1
      );
      const virtaulConsultations = await dashboardRepo.getAppointmentsByDoctorId(
        doctor.id,
        args.summaryDate,
        'ONLINE'
      );
      const totalPhysicalConsultations = await dashboardRepo.getAppointmentsByDoctorId(
        doctor.id,
        args.summaryDate,
        'PHYSICAL'
      );
      const patientCancelCount = await dashboardRepo.getPatientCancelCount(
        doctor.id,
        args.summaryDate
      );
      const auidoCount = await dashboardRepo.getCallsCount(doctor.id, 'AUDIO', args.summaryDate);
      const videoCount = await dashboardRepo.getCallsCount(doctor.id, 'VIDEO', args.summaryDate);
      const chatCount = await dashboardRepo.getCallsCount(doctor.id, 'CHAT', args.summaryDate);
      const reschduleCount = await dashboardRepo.getRescheduleCount(
        doctor.id,
        args.summaryDate,
        TRANSFER_INITIATED_TYPE.DOCTOR
      );
      const patientReschduleCount = await dashboardRepo.getRescheduleCount(
        doctor.id,
        args.summaryDate,
        TRANSFER_INITIATED_TYPE.PATIENT
      );
      const slotsCount = await dashboardRepo.getDoctorSlots(
        doctor.id,
        args.summaryDate,
        context.doctorsDb
      );
      const consultHours = await dashboardRepo.getTimePerConsult(doctor.id, args.summaryDate);
      const unpaidFollowUpCount = await dashboardRepo.getFollowUpBookedCount(
        doctor.id,
        args.summaryDate,
        '0'
      );
      const paidFollowUpCount = await dashboardRepo.getFollowUpBookedCount(
        doctor.id,
        args.summaryDate,
        '1'
      );
      const callDuration = await dashboardRepo.getOnTimeConsultations(doctor.id, args.summaryDate);
      const casesheetPrepTime = await dashboardRepo.getCasesheetPrepTime(
        doctor.id,
        args.summaryDate
      );
      const within15Consultations = await dashboardRepo.get15ConsultationTime(
        args.summaryDate,
        doctor.id,
        0
      );
      const adminIdRows = await adminMapRepo.getAdminIds(doctor.id);
      let adminIds = '';
      if (adminIdRows.length > 0) {
        adminIdRows.forEach((adminId) => {
          adminIds += adminId.adminuser.id + ',';
        });
      }
      const dashboardSummaryAttrs: Partial<SdDashboardSummary> = {
        doctorId: doctor.id,
        doctorName: doctor.firstName + ' ' + doctor.lastName,
        totalConsultations,
        totalVirtualConsultations: virtaulConsultations,
        totalPhysicalConsultations,
        slotsDurationInMinutes: totalSlotsTime,
        patientCancelCount: patientCancelCount,
        appointmentDateTime: args.summaryDate,
        audioConsultations: auidoCount,
        videoConsultations: videoCount,
        chatConsultations: chatCount,
        totalFollowUp: paidFollowUpCount + unpaidFollowUpCount,
        rescheduledByDoctor: reschduleCount,
        rescheduledByPatient: patientReschduleCount,
        consultSlots: slotsCount,
        timePerConsult: consultHours,
        paidFollowUp: paidFollowUpCount,
        unPaidFollowUp: unpaidFollowUpCount,
        onTimeConsultations: callDuration,
        casesheetPrepTime,
        within15Consultations,
        totalConsultationTime,
        adminIds,
        loggedInHours,
        awayHours,
      };
      await dashboardRepo.saveDashboardDetails(dashboardSummaryAttrs);
    });
  }

  return { doctorId: '', doctorName: '', appointmentDateTime: new Date(), totalConsultation: 0 };
};

const updateDoctorFeeSummary: Resolver<
  null,
  { summaryDate: Date; doctorId: string },
  ConsultServiceContext,
  DoctorFeeSummaryResult
> = async (parent, args, context) => {
  const { docRepo, dashboardRepo } = getRepos(context);
  const docsList = await docRepo.getAllDoctors(args.doctorId);
  docsList.forEach(async (doctor) => {
    const totalConsultations = await dashboardRepo.getAppointmentsDetailsByDoctorId(
      doctor.id,
      args.summaryDate,
      ConsultMode.BOTH
    );
    let totalFee: number = 0;
    if (totalConsultations.length) {
      totalConsultations.forEach(async (consultation, index, array) => {
        const paymentDetails = await dashboardRepo.getAppointmentPaymentDetailsByApptId(
          consultation.id
        );
        if (!_isEmpty(paymentDetails) && paymentDetails) {
          totalFee += parseFloat(paymentDetails.amountPaid.toString());
        }
        if (index + 1 === array.length) {
          saveDetails();
        }
      });
    }
    async function saveDetails() {
      const doctorFeeAttrs: Partial<DoctorFeeSummary> = {
        appointmentDateTime: args.summaryDate,
        doctorId: doctor.id,
        doctorName: doctor.firstName + ' ' + doctor.lastName,
        amountPaid: totalFee,
        specialtiyId: doctor.specialty.id,
        specialityName: doctor.specialty.name,
        areaName: doctor.doctorHospital[0].facility.city,
        appointmentsCount: totalConsultations.length,
      };
      await dashboardRepo.saveDoctorFeeSummaryDetails(doctorFeeAttrs);
    }
  });

  return { status: true };
};

const getopenTokFileUrl: Resolver<
  null,
  { appointmentId: string },
  DoctorsServiceContext,
  GetopenTokFileUrlResult
> = async (parent, args, context) => {
  const { dashboardRepo } = getRepos(context);
  if (!args.appointmentId) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  const fileUrls = await dashboardRepo.getFileDownloadUrls(args.appointmentId);
  return { urls: fileUrls };
};
const updateSpecialtyCount: Resolver<
  null,
  { specialityId: string; weekDay: string },
  DoctorsServiceContext,
  updateSpecialtyCountResult
> = async (parent, args, context) => {
  const { docRepo, DoctorSpecialtyRepo, CurrentAvailStatusRepo } = getRepos(context);
  //get speciality details
  const specialityDetails = await DoctorSpecialtyRepo.findById(args.specialityId);
  if (!specialityDetails) throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID);
  //get totalDoctors count for given speciality
  const totalDoctorsCount = await docRepo.getToatalDoctorsForSpeciality(args.specialityId, 1);
  //get online doctors count for given speciality
  const totalOnlineDoctorsCount = await docRepo.getToatalDoctorsForSpeciality(args.specialityId, 2);
  //insert in db
  await CurrentAvailStatusRepo.updateavailabilityStatus(
    args.specialityId,
    specialityDetails.name,
    totalDoctorsCount,
    totalOnlineDoctorsCount
  );
  //send response
  return { updated: true };
};
const updateUtilizationCapacity: Resolver<
  null,
  { specialityId: string; weekDay: WeekDay },
  DoctorsServiceContext,
  updateUtilizationCapacityResult
> = async (parent, args, context) => {
  const {
    apptRepo,
    docRepo,
    DoctorSpecialtyRepo,
    UtilizationCapacityRepo,
    consultHoursRepo,
  } = getRepos(context);
  const DoctorSpeciality = await DoctorSpecialtyRepo.findById(args.specialityId);
  if (!DoctorSpeciality) throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID);
  const Doctors = await docRepo.getSpecialityDoctors(args.specialityId);
  if (!Doctors) throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID);
  const doctorIds = Doctors.map((doctor) => {
    return doctor.id;
  });
  const totalSlots = await consultHoursRepo.getTotalConsultHours(doctorIds, args.weekDay);
  const appointments = await apptRepo.getBookedSlots(doctorIds);
  await UtilizationCapacityRepo.updateUtilization(
    args.specialityId,
    DoctorSpeciality.name,
    totalSlots,
    appointments
  );
  return { updated: true };
};
export const sdDashboardSummaryResolvers = {
  Mutation: {
    updateSdSummary,
    updateDoctorFeeSummary,
    updatePhrDocSummary,
    updateConsultRating,
    updateSpecialtyCount,
    updateUtilizationCapacity,
    updatePatientType,
  },
  Query: {
    getopenTokFileUrl,
  },
};
