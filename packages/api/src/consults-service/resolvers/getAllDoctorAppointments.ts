import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { Appointment } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Patient } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const getAllDoctorAppointmentsTypeDefs = gql`
  type AppointmentAndPatient {
    appointment: Appointment!
    patient: Patient!
  }

  type GetAllDoctorAppointmentsResult {
    appointmentsAndPatients: [AppointmentAndPatient!]!
  }

  extend type Query {
    getAllDoctorAppointments(doctorId: String!): GetAllDoctorAppointmentsResult!
  }
`;

type AppointmentAndPatient = {
  appointment: Appointment;
  patient: Patient;
};
type GetAllDoctorAppointmentsResult = {
  appointmentsAndPatients: AppointmentAndPatient[];
};
type GetAllDoctorAppointmentsInput = {
  doctorId: string;
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb, mobileNumber }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  mobileNumber: mobileNumber,
});

const checkAuth = async (docRepo: DoctorRepository, mobileNumber: string, doctorId: string) => {
  const currentDoctor = await docRepo.searchDoctorByMobileNumber(mobileNumber, true);
  const authorized = currentDoctor && currentDoctor.id && currentDoctor.id === doctorId;
  if (!authorized) throw new AphError(AphErrorMessages.UNAUTHORIZED);
};

const getAllDoctorAppointments: Resolver<
  null,
  GetAllDoctorAppointmentsInput,
  ConsultServiceContext,
  GetAllDoctorAppointmentsResult
> = async (parent, { doctorId }, context) => {
  const { patRepo, apptRepo, docRepo, mobileNumber } = getRepos(context);
  // mocking fot tes


  await checkAuth(docRepo, mobileNumber, doctorId);
  const allDocAppointments = await apptRepo.find({
    where: { doctorId },
    order: { appointmentDateTime: 'DESC' },
  });
  const appointmentsAndPatients = await Promise.all(
    allDocAppointments.map(async (appointment) => {
      const patient = await patRepo.findOneOrFail(appointment.parentId);
      return { appointment, patient };
    })
  );
  return { appointmentsAndPatients };
};

export const getAllDoctorAppointmentsResolvers = {
  Query: {
    getAllDoctorAppointments,
  },
};
