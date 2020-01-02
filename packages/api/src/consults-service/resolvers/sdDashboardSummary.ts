import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Between } from 'typeorm';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { Appointment, SdDashboardSummary } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { SdDashboardSummaryRepository } from 'consults-service/repositories/sdDashboardSummaryRepository';

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

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  dashboardRepo: consultsDb.getCustomRepository(SdDashboardSummaryRepository),
});

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
        args.summaryDate
      );
      const dashboardSummaryAttrs: Partial<SdDashboardSummary> = {
        doctorId: doctor.id,
        doctorName: doctor.firstName,
        totalConsultations,
        appointmentDateTime: args.summaryDate,
      };
      await dashboardRepo.saveDashboardDetails(dashboardSummaryAttrs);
    });
  }

  return { doctorId: '', doctorName: '', appointmentDateTime: new Date(), totalConsultation: 0 };
};

export const sdDashboardSummaryResolvers = {
  Mutation: {
    updateSdSummary,
  },
};
