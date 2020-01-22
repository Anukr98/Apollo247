import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { JdDashboardSummary } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { JdDashboardSummaryRepository } from 'consults-service/repositories/jdDashboardSummaryRepository';
import { differenceInSeconds } from 'date-fns';

export const jdDashboardSummaryTypeDefs = gql`
  type JdDashboardSummaryResult {
    doctorId: String
    doctorName: String
    appointmentDateTime: Date
    totalConsultation: Int
  }

  type UpdateCasesheetResult {
    status: Boolean
    caseSheetCount: Int
  }

  extend type Mutation {
    updateJdSummary(summaryDate: Date, doctorId: String): JdDashboardSummaryResult!
    updateCaseSheetTime(limit: Int): UpdateCasesheetResult!
  }
`;

type JdDashboardSummaryResult = {
  doctorId: string;
  doctorName: string;
  appointmentDateTime: Date;
  totalConsultation: number;
};

type UpdateCasesheetResult = {
  status: Boolean;
  caseSheetCount: number;
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  dashboardRepo: consultsDb.getCustomRepository(JdDashboardSummaryRepository),
});

const updateCaseSheetTime: Resolver<
  null,
  { limit: number },
  ConsultServiceContext,
  UpdateCasesheetResult
> = async (parent, args, context) => {
  const { dashboardRepo } = getRepos(context);
  const casesheets = await dashboardRepo.getCaseSheetsList(args.limit);
  if (casesheets.length > 0) {
    casesheets.forEach(async (sheet) => {
      const callDetails = await dashboardRepo.getCallDetailTime(sheet.appointment.id);
      if (callDetails.length > 0) {
        const duration = Math.abs(
          differenceInSeconds(callDetails[callDetails.length - 1].endTime, sheet.createdDate)
        );
        await dashboardRepo.updateCaseSheetEndTime(
          sheet.id,
          callDetails[callDetails.length - 1].endTime,
          duration
        );
      }
    });
  }
  return { status: true, caseSheetCount: casesheets.length };
};

const updateJdSummary: Resolver<
  null,
  { summaryDate: Date; doctorId: string },
  ConsultServiceContext,
  JdDashboardSummaryResult
> = async (parent, args, context) => {
  const { docRepo, dashboardRepo } = getRepos(context);
  const docsList = await docRepo.getAllJuniorDoctors(args.doctorId);
  if (docsList.length > 0) {
    docsList.map(async (doctor) => {
      const waitTimePerChat = await dashboardRepo.getWaitTimePerChat(args.summaryDate, doctor.id);
      const caseSheetFillTime = await dashboardRepo.timePerChat(args.summaryDate, doctor.id);
      const totalCompletedChats = await dashboardRepo.getTotalCompletedChats(
        args.summaryDate,
        doctor.id
      );
      const audioChats = await dashboardRepo.getCallsCount(doctor.id, 'AUDIO', args.summaryDate);
      const videoChats = await dashboardRepo.getCallsCount(doctor.id, 'VIDEO', args.summaryDate);
      const chatConsults = await dashboardRepo.getCallsCount(doctor.id, 'CHAT', args.summaryDate);
      const cases15Less = await dashboardRepo.appointmentBefore15(args.summaryDate, doctor.id);
      const dashboardSummaryAttrs: Partial<JdDashboardSummary> = {
        doctorId: doctor.id,
        doctorName: doctor.firstName + ' ' + doctor.lastName,
        appointmentDateTime: args.summaryDate,
        waitTimePerChat,
        caseSheetFillTime,
        totalCompletedChats,
        timePerChat: caseSheetFillTime,
        audioChats,
        videoChats,
        chatConsults,
        jdsUtilization: 0,
        loggedInHours: 0,
        awayHours: 0,
        totalConsultationTime: 0,
        casesCompleted: totalCompletedChats,
        cases15Less,
      };
      await dashboardRepo.saveJdDashboardDetails(dashboardSummaryAttrs);
    });
  }

  return { doctorId: '', doctorName: '', appointmentDateTime: new Date(), totalConsultation: 0 };
};

export const jdDashboardSummaryResolvers = {
  Mutation: {
    updateJdSummary,
    updateCaseSheetTime,
  },
};
