import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { SdDashboardSummary, FeedbackDashboardSummary } from 'consults-service/entities';
import { FEEDBACKTYPE } from 'profiles-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { SdDashboardSummaryRepository } from 'consults-service/repositories/sdDashboardSummaryRepository';
import { PatientFeedbackRepository } from 'profiles-service/repositories/patientFeedbackRepository';

export const sdDashboardSummaryTypeDefs = gql`
  type dashboardSummaryResult {
    doctorId: String
    doctorName: String
    appointmentDateTime: Date
    totalConsultation: Int
  }

  extend type Mutation {
    updateSdSummary(summaryDate: Date): dashboardSummaryResult!
  }
`;

type dashboardSummaryResult = {
  doctorId: string;
  doctorName: string;
  appointmentDateTime: Date;
  totalConsultation: number;
};

type feedbackSummaryResult = {
  ratingRowsCount: number;
};

type FeedbackCounts = {
  rating: string;
  ratingCount: number;
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  dashboardRepo: consultsDb.getCustomRepository(SdDashboardSummaryRepository),
  feedbackRepo: consultsDb.getCustomRepository(PatientFeedbackRepository),
});

const updateConsultRating: Resolver<
  null,
  { summaryDate: Date },
  ConsultServiceContext,
  feedbackSummaryResult
> = async (parent, args, context) => {
  const { feedbackRepo, dashboardRepo } = getRepos(context);
  const feedbackData: FeedbackCounts[] = await feedbackRepo.getFeedbackByDate(
    args.summaryDate,
    FEEDBACKTYPE.CONSULT
  );
  let goodRating = 0,
    okRating = 0,
    poorRating = 0,
    greatRating = 0;
  if (feedbackData.length > 0) {
    feedbackData.forEach((record) => {
      if (record.rating == 'GOOD') {
        goodRating = record.ratingCount;
      } else if (record.rating == 'OK') {
        okRating = record.ratingCount;
      } else if (record.rating == 'GREAT') {
        greatRating = record.ratingCount;
      } else if (record.rating == 'POOR') {
        poorRating = record.ratingCount;
      }
    });
    const feedbackAttrs: Partial<FeedbackDashboardSummary> = {
      ratingDate: args.summaryDate,
      goodRating,
      noRating: 0,
      poorRating,
      greatRating,
      okRating,
    };
    await dashboardRepo.saveFeedbackDetails(feedbackAttrs);
  }
  return { ratingRowsCount: feedbackData.length };
};

const updateSdSummary: Resolver<
  null,
  { summaryDate: Date },
  ConsultServiceContext,
  dashboardSummaryResult
> = async (parent, args, context) => {
  const { docRepo, dashboardRepo } = getRepos(context);
  const docsList = await docRepo.getAllDoctors();

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

export const sdDashboardSummaryResolvers = {
  Mutation: {
    updateSdSummary,
    updateConsultRating,
  },
};
