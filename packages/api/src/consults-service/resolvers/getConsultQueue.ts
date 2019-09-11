import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { Patient } from 'profiles-service/entities';
import { Appointment } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';

export const getConsultQueueTypeDefs = gql`
  type ConsultQueueItem {
    patient: Patient!
    appointment: Appointment!
  }

  type GetConsultQueueResult {
    consultQueue: [ConsultQueueItem!]!
  }

  extend type Query {
    getConsultQueue(doctorId: String!): GetConsultQueueResult!
  }
`;

type GqlConsultQueueItem = {
  patient: Patient;
  appointment: Appointment;
};
type GetConsultQueueResult = {
  consultQueue: GqlConsultQueueItem[];
};
type GetConsultQueueInput = {
  doctorId: string;
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  cqRepo: consultsDb.getCustomRepository(ConsultQueueRepository),
});

const checkAuth = async (docRepo: DoctorRepository, firebaseUid: string, doctorId: string) => {
  const currentDoctor = await docRepo.getDoctorDetails(firebaseUid);
  const authorized = currentDoctor && currentDoctor.id && currentDoctor.id === doctorId;
  if (!authorized) throw new AphError(AphErrorMessages.UNAUTHORIZED);
};

const getConsultQueue: Resolver<
  null,
  GetConsultQueueInput,
  ConsultServiceContext,
  GetConsultQueueResult
> = async (parent, { doctorId }, context) => {
  const { apptRepo, docRepo, patRepo, cqRepo } = getRepos(context);
  await checkAuth(docRepo, context.firebaseUid, doctorId);

  const dbConsultQueue = await cqRepo.find({ doctorId });
  const appointmentIds = dbConsultQueue.map((cq) => cq.appointmentId);
  const appointments = await apptRepo.findByIds(appointmentIds, {
    order: { appointmentDateTime: 'DESC' },
  });

  const consultQueue = await Promise.all(
    appointments.map(async (appointment) => {
      const patient = (await patRepo.findById(appointment.patientId)) as Patient;
      return { appointment, patient };
    })
  );
  return { consultQueue };
};

export const getConsultQueueResolvers = {
  Query: {
    getConsultQueue,
  },
};
