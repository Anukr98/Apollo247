import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { JdDashboardSummary } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { JdDashboardSummaryRepository } from 'consults-service/repositories/jdDashboardSummaryRepository';
import { differenceInSeconds, addMinutes } from 'date-fns';
import { AdminDoctorMap } from 'doctors-service/repositories/adminDoctorRepository';
import { LoginHistoryRepository } from 'doctors-service/repositories/loginSessionRepository';

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
    appointmentId: String
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
  appointmentId: string;
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  dashboardRepo: consultsDb.getCustomRepository(JdDashboardSummaryRepository),
  adminMapRepo: doctorsDb.getCustomRepository(AdminDoctorMap),
  loginSessionRepo: doctorsDb.getCustomRepository(LoginHistoryRepository),
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
      let updatedDate;
      if (callDetails.length > 0 && callDetails[callDetails.length - 1].endTime != null) {
        updatedDate = callDetails[callDetails.length - 1].endTime;
      } else {
        updatedDate = addMinutes(sheet.createdDate, 5);
      }
      const duration = Math.abs(differenceInSeconds(updatedDate, sheet.createdDate));
      await dashboardRepo.updateCaseSheetEndTime(sheet.id, updatedDate, duration);
    });
  }
  return {
    status: true,
    caseSheetCount: casesheets.length,
    appointmentId: '',
  };
};

const updateJdSummary: Resolver<
  null,
  { summaryDate: Date; doctorId: string },
  ConsultServiceContext,
  JdDashboardSummaryResult
> = async (parent, args, context) => {
  const { docRepo, dashboardRepo, adminMapRepo, loginSessionRepo } = getRepos(context);
  const docsList = await docRepo.getAllJuniorDoctors(args.doctorId);
  if (docsList.length > 0) {
    docsList.map(async (doctor) => {
      const waitTimePerChat = await dashboardRepo.getWaitTimePerChat(args.summaryDate, doctor.id);
      const caseSheetFillTime = await dashboardRepo.timePerChat(args.summaryDate, doctor.id);
      const totalCompletedChats = await dashboardRepo.getTotalCompletedChats(
        args.summaryDate,
        doctor.id
      );
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
      const audioChats = await dashboardRepo.getCallsCount(doctor.id, 'AUDIO', args.summaryDate);
      const videoChats = await dashboardRepo.getCallsCount(doctor.id, 'VIDEO', args.summaryDate);
      const chatConsults = await dashboardRepo.getCallsCount(doctor.id, 'CHAT', args.summaryDate);
      const cases15Less = await dashboardRepo.appointmentBefore15(args.summaryDate, doctor.id);
      const completeMore15 = await dashboardRepo.getConsultationTime(
        args.summaryDate,
        doctor.id,
        1
      );
      const completeWithin15 = await dashboardRepo.getConsultationTime(
        args.summaryDate,
        doctor.id,
        0
      );
      const totalConsultationTime = await dashboardRepo.getTotalConsultationTime(
        args.summaryDate,
        doctor.id,
        1
      );
      const avgTimePerConsult = await dashboardRepo.getTotalConsultationTime(
        args.summaryDate,
        doctor.id,
        0
      );
      const totalAllocatedChats = await dashboardRepo.getTotalAllocatedChats(
        args.summaryDate,
        doctor.id
      );
      const casesOngoing = await dashboardRepo.getOngoingCases(args.summaryDate, doctor.id);
      const caseSheetNotSatisfactory = await dashboardRepo.getCasesheetNotSatisfactory(
        args.summaryDate,
        doctor.id
      );
      const adminIdRows = await adminMapRepo.getAdminIds(doctor.id);
      let adminIds = '';
      if (adminIdRows.length > 0) {
        adminIdRows.forEach((adminId) => {
          adminIds += adminId.adminuser.id + ',';
        });
      }
      const dashboardSummaryAttrs: Partial<JdDashboardSummary> = {
        doctorId: doctor.id,
        doctorName: doctor.firstName + ' ' + doctor.lastName,
        appointmentDateTime: args.summaryDate,
        adminIds,
        waitTimePerChat,
        caseSheetFillTime,
        totalCompletedChats,
        timePerChat: caseSheetFillTime,
        audioChats,
        videoChats,
        chatConsults,
        jdsUtilization: 0,
        loggedInHours,
        awayHours,
        totalConsultationTime,
        casesCompleted: totalCompletedChats,
        cases15Less,
        completeMore15,
        completeWithin15,
        startOnTimeConsults: 0,
        avgTimePerConsult,
        totalAllocatedChats,
        casesOngoing,
        caseSheetNotSatisfactory,
        isActive: <boolean>doctor.isActive,
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
