import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { Appointment } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getAllDoctorAppointmentsTypeDefs = gql`
  type GetAllDoctorAppointmentsResult {
    appointments: [Appointment!]!
  }

  extend type Query {
    getAllDoctorAppointments(doctorId: String!): GetAllDoctorAppointmentsResult!
  }
`;

type GetAllDoctorAppointmentsResult = {
  appointments: Appointment[];
};
type GetAllDoctorAppointmentsInput = {
  doctorId: string;
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
});

const checkAuth = async (docRepo: DoctorRepository, firebaseUid: string, doctorId: string) => {
  const currentDoctor = await docRepo.getDoctorDetails(firebaseUid);
  const authorized = currentDoctor && currentDoctor.id && currentDoctor.id === doctorId;
  if (!authorized) throw new AphError(AphErrorMessages.UNAUTHORIZED);
};

const getAllDoctorAppointments: Resolver<
  null,
  GetAllDoctorAppointmentsInput,
  ConsultServiceContext,
  GetAllDoctorAppointmentsResult
> = async (parent, { doctorId }, context) => {
  const { apptRepo, docRepo } = getRepos(context);
  await checkAuth(docRepo, context.firebaseUid, doctorId);
  const appointments = await apptRepo.find({
    where: { doctorId },
    order: { appointmentDateTime: 'DESC' },
  });
  return { appointments };
};

export const getAllDoctorAppointmentsResolvers = {
  Query: {
    getAllDoctorAppointments,
  },
};
