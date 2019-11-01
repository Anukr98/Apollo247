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
import _sample from 'lodash/sample';
import { DOCTOR_ONLINE_STATUS, DoctorType } from 'doctors-service/entities';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';

export const consultQueueTypeDefs = gql`
  type ConsultQueueItem {
    id: Int!
    isActive: Boolean!
    patient: Patient!
    appointment: Appointment!
  }

  type GetConsultQueueResult {
    consultQueue: [ConsultQueueItem!]!
  }

  extend type Query {
    getConsultQueue(doctorId: String!): GetConsultQueueResult!
  }

  type AddToConsultQueueResult {
    id: Int!
    doctorId: String!
  }

  type RemoveFromConsultQueueResult {
    consultQueue: [ConsultQueueItem!]!
  }

  extend type Mutation {
    addToConsultQueue(appointmentId: String!): AddToConsultQueueResult!
    removeFromConsultQueue(id: Int!): RemoveFromConsultQueueResult!
  }
`;

type GqlConsultQueueItem = {
  id: number;
  isActive: boolean;
  patient: Patient;
  appointment: Appointment;
};
type GqlConsultQueue = GqlConsultQueueItem[];

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  cqRepo: consultsDb.getCustomRepository(ConsultQueueRepository),
  caseSheetRepo: consultsDb.getCustomRepository(CaseSheetRepository),
});

const checkAuth = async (docRepo: DoctorRepository, firebaseUid: string, doctorId: string) => {
  const currentDoctor = await docRepo.getDoctorDetails(firebaseUid);
  const authorized = currentDoctor && currentDoctor.id && currentDoctor.id === doctorId;
  if (!authorized) throw new AphError(AphErrorMessages.UNAUTHORIZED);
};

const buildGqlConsultQueue = async (doctorId: string, context: ConsultServiceContext) => {
  const { cqRepo, apptRepo, patRepo } = getRepos(context);
  const dbConsultQueue = await cqRepo.find({ where: { doctorId }, order: { id: 'ASC' } });
  const consultQueue = await Promise.all(
    dbConsultQueue.map(async (cq) => {
      const { id, isActive } = cq;
      const appointment = await apptRepo.findOneOrFail(cq.appointmentId);
      const patient = await patRepo.findOneOrFail(appointment.patientId);
      return { id, isActive, appointment, patient };
    })
  );
  return consultQueue;
};

type GetConsultQueueResult = {
  consultQueue: GqlConsultQueue;
};
type GetConsultQueueInput = {
  doctorId: string;
};

const getConsultQueue: Resolver<
  null,
  GetConsultQueueInput,
  ConsultServiceContext,
  GetConsultQueueResult
> = async (parent, { doctorId }, context) => {
  const { docRepo } = getRepos(context);
  await checkAuth(docRepo, context.firebaseUid, doctorId);
  const consultQueue = await buildGqlConsultQueue(doctorId, context);
  return { consultQueue };
};

type AddToConsultQueueInput = { appointmentId: string };
type AddToConsultQueueResult = { id: number; doctorId: string };
const addToConsultQueue: Resolver<
  null,
  AddToConsultQueueInput,
  ConsultServiceContext,
  AddToConsultQueueResult
> = async (parent, { appointmentId }, context) => {
  const { cqRepo, docRepo, apptRepo, caseSheetRepo } = getRepos(context);
  await apptRepo.findOneOrFail(appointmentId);

  const juniorDoctorCaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(appointmentId);
  if (juniorDoctorCaseSheet != null) {
    const queueResult: AddToConsultQueueResult = {
      id: 0,
      doctorId: '',
    };
    return queueResult;
  }

  const existingQueueItem = await cqRepo.findOne({ appointmentId });
  if (existingQueueItem) throw new AphError(AphErrorMessages.APPOINTMENT_ALREADY_IN_CONSULT_QUEUE);
  const onlineJrDocs = await docRepo.find({
    onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
    doctorType: DoctorType.JUNIOR,
    isActive: true,
  });
  const chosenJrDoc = _sample(onlineJrDocs);
  if (!chosenJrDoc) throw new AphError(AphErrorMessages.NO_ONLINE_DOCTORS);
  const doctorId = chosenJrDoc.id;
  const { id } = await cqRepo.save(cqRepo.create({ appointmentId, doctorId, isActive: true }));
  await apptRepo.updateConsultStarted(appointmentId, true);
  return { id, doctorId };
};

type RemoveFromConsultQueueInput = { id: number };
type RemoveFromConsultQueueResult = { consultQueue: GqlConsultQueue };
const removeFromConsultQueue: Resolver<
  null,
  RemoveFromConsultQueueInput,
  ConsultServiceContext,
  RemoveFromConsultQueueResult
> = async (parent, { id }, context) => {
  const { docRepo, cqRepo } = getRepos(context);
  const consultQueueItemToDeactivate = await cqRepo.findOneOrFail(id);
  const { doctorId } = consultQueueItemToDeactivate;
  await checkAuth(docRepo, context.firebaseUid, doctorId);
  await cqRepo.update(consultQueueItemToDeactivate.id, { isActive: false });
  const consultQueue = await buildGqlConsultQueue(doctorId, context);
  return { consultQueue };
};

export const consultQueueResolvers = {
  Query: {
    getConsultQueue,
  },
  Mutation: {
    addToConsultQueue,
    removeFromConsultQueue,
  },
};
