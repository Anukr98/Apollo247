import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import {
  SdDashboardSummary,
  FeedbackDashboardSummary,
  PhrDocumentsSummary,
  DoctorFeeSummary,
} from 'consults-service/entities';
import { ConsultMode } from 'doctors-service/entities';
import { FEEDBACKTYPE } from 'profiles-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { SdDashboardSummaryRepository } from 'consults-service/repositories/sdDashboardSummaryRepository';
import { PatientFeedbackRepository } from 'profiles-service/repositories/patientFeedbackRepository';
import { PatientHelpTicketRepository } from 'profiles-service/repositories/patientHelpTicketsRepository';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import _isEmpty from 'lodash/isEmpty';

export const sdDashboardSummaryTypeDefs = gql`
  type DashboardSummaryResult {
    doctorId: String
    doctorName: String
    appointmentDateTime: Date
    totalConsultation: Int
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

  extend type Mutation {
    updateSdSummary(summaryDate: Date, doctorId: String): DashboardSummaryResult!
    updateDoctorFeeSummary(summaryDate: Date, doctorId: String): DoctorFeeSummaryResult!
    updateConsultRating(summaryDate: Date): FeedbackSummaryResult
    updatePhrDocSummary(summaryDate: Date): DocumentSummaryResult
  }
`;

type DashboardSummaryResult = {
  doctorId: string;
  doctorName: string;
  appointmentDateTime: Date;
  totalConsultation: number;
};

type DoctorFeeSummaryResult = {
  status: boolean;
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

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  dashboardRepo: consultsDb.getCustomRepository(SdDashboardSummaryRepository),
  feedbackRepo: patientsDb.getCustomRepository(PatientFeedbackRepository),
  helpTicketRepo: patientsDb.getCustomRepository(PatientHelpTicketRepository),
  medOrderRepo: patientsDb.getCustomRepository(MedicineOrdersRepository),
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
  console.log(feedbackData, 'feedback ata');
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
  const { dashboardRepo, medOrderRepo } = getRepos(context);
  const docCount = await dashboardRepo.getDocumentSummary(args.summaryDate);
  const prescritionCount = await medOrderRepo.getPrescriptionsCount(args.summaryDate);
  const phrDocAttrs: Partial<PhrDocumentsSummary> = {
    documentDate: args.summaryDate,
    appointmentDoc: docCount,
    medicineOrderDoc: prescritionCount,
  };
  await dashboardRepo.saveDocumentSummary(phrDocAttrs);
  return { apptDocCount: docCount, medDocCount: prescritionCount };
};

const updateSdSummary: Resolver<
  null,
  { summaryDate: Date; doctorId: string },
  ConsultServiceContext,
  DashboardSummaryResult
> = async (parent, args, context) => {
  const { docRepo, dashboardRepo } = getRepos(context);
  const docsList = await docRepo.getAllDoctors(args.doctorId);
  if (docsList.length > 0) {
    docsList.map(async (doctor) => {
      const totalConsultations = await dashboardRepo.getAppointmentsByDoctorId(
        doctor.id,
        args.summaryDate,
        'BOTH'
      );
      const virtaulConsultations = await dashboardRepo.getAppointmentsByDoctorId(
        doctor.id,
        args.summaryDate,
        'ONLINE'
      );
      const auidoCount = await dashboardRepo.getCallsCount(doctor.id, 'AUDIO', args.summaryDate);
      const videoCount = await dashboardRepo.getCallsCount(doctor.id, 'VIDEO', args.summaryDate);
      const reschduleCount = await dashboardRepo.getRescheduleCount(doctor.id, args.summaryDate);
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
      const dashboardSummaryAttrs: Partial<SdDashboardSummary> = {
        doctorId: doctor.id,
        doctorName: doctor.firstName + ' ' + doctor.lastName,
        totalConsultations,
        totalVirtualConsultations: virtaulConsultations,
        appointmentDateTime: args.summaryDate,
        audioConsultations: auidoCount,
        videoConsultations: videoCount,
        rescheduledByDoctor: reschduleCount,
        consultSlots: slotsCount,
        timePerConsult: consultHours,
        paidFollowUp: paidFollowUpCount,
        unPaidFollowUp: unpaidFollowUpCount,
        onTimeConsultations: callDuration,
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
        amountPaid: totalFee,
        appointmentsCount: totalConsultations.length,
      };
      await dashboardRepo.saveDoctorFeeSummaryDetails(doctorFeeAttrs);
    }
  });

  return { status: true };
};

export const sdDashboardSummaryResolvers = {
  Mutation: {
    updateSdSummary,
    updateDoctorFeeSummary,
    updatePhrDocSummary,
    updateConsultRating,
  },
};
