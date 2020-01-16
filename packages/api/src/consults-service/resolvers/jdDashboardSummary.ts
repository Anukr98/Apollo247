import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { JdDashboardSummary } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { JdDashboardSummaryRepository } from 'consults-service/repositories/jdDashboardSummaryRepository';

export const jdDashboardSummaryTypeDefs = gql`
  type JdDashboardSummaryResult {
    doctorId: String
    doctorName: String
    appointmentDateTime: Date
    totalConsultation: Int
  }

  extend type Mutation {
    updateJdSummary(summaryDate: Date, doctorId: String): JdDashboardSummaryResult!
  }
`;

type JdDashboardSummaryResult = {
  doctorId: string;
  doctorName: string;
  appointmentDateTime: Date;
  totalConsultation: number;
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  dashboardRepo: consultsDb.getCustomRepository(JdDashboardSummaryRepository),
});

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
      const dashboardSummaryAttrs: Partial<JdDashboardSummary> = {
        doctorId: doctor.id,
        doctorName: doctor.firstName + ' ' + doctor.lastName,
        appointmentDateTime: args.summaryDate,
      };
      await dashboardRepo.saveJdDashboardDetails(dashboardSummaryAttrs);
    });
  }

  return { doctorId: '', doctorName: '', appointmentDateTime: new Date(), totalConsultation: 0 };
};

export const jdDashboardSummaryResolvers = {
  Mutation: {
    updateJdSummary,
  },
};
