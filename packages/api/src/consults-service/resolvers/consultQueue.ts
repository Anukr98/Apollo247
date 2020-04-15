import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import {
  Patient,
  PatientFamilyHistory,
  PatientLifeStyle,
  PatientMedicalHistory,
} from 'profiles-service/entities';
import { Appointment, ConsultQueueItem, APPOINTMENT_STATE } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
//import _sample from 'lodash/sample';
import { DOCTOR_ONLINE_STATUS, DoctorType } from 'doctors-service/entities';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { PatientFamilyHistoryRepository } from 'profiles-service/repositories/patientFamilyHistoryRepository';
import { PatientLifeStyleRepository } from 'profiles-service/repositories/patientLifeStyleRepository';
import { PatientMedicalHistoryRepository } from 'profiles-service/repositories/patientMedicalHistory';

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

  type JuniorDoctorsList {
    juniorDoctorId: ID!
    doctorName: String!
    queueCount: Int!
  }

  type AddToConsultQueueResult {
    id: Int!
    doctorId: String!
    totalJuniorDoctors: Int!
    totalJuniorDoctorsOnline: Int!
    juniorDoctorsList: [JuniorDoctorsList]!
  }

  type RemoveFromConsultQueueResult {
    consultQueue: [ConsultQueueItem!]!
  }

  input ConsultQueueInput {
    appointmentId: String!
    height: String
    weight: String
    temperature: String
    bp: String
    lifeStyle: String
    familyHistory: String
    dietAllergies: String
    drugAllergies: String
  }

  extend type Mutation {
    addToConsultQueue(appointmentId: String!): AddToConsultQueueResult!
    removeFromConsultQueue(id: Int!): RemoveFromConsultQueueResult!
    addToConsultQueueWithAutomatedQuestions(
      consultQueueInput: ConsultQueueInput
    ): AddToConsultQueueResult!
  }
`;

type GqlConsultQueueItem = {
  id: number;
  isActive: boolean;
  patient: Patient;
  appointment: Appointment;
};
type GqlConsultQueue = GqlConsultQueueItem[];

const getRepos = ({ consultsDb, doctorsDb, patientsDb, mobileNumber }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  cqRepo: consultsDb.getCustomRepository(ConsultQueueRepository),
  caseSheetRepo: consultsDb.getCustomRepository(CaseSheetRepository),
  mobileNumber: mobileNumber,
});

const checkAuth = async (docRepo: DoctorRepository, mobileNumber: string, doctorId: string) => {
  const currentDoctor = await docRepo.searchDoctorByMobileNumber(mobileNumber, true);
  const authorized = currentDoctor && currentDoctor.id && currentDoctor.id === doctorId;
  if (!authorized) throw new AphError(AphErrorMessages.UNAUTHORIZED);
};

const buildGqlConsultQueue = async (doctorId: string, context: ConsultServiceContext) => {
  const limit = parseInt(
    process.env.INACTIVE_CONSULT_QUEUE_LIMT ? process.env.INACTIVE_CONSULT_QUEUE_LIMT : '1',
    10
  );
  const { cqRepo, apptRepo, patRepo } = getRepos(context);
  const activeQueueItems = await cqRepo.find({
    where: { doctorId, isActive: true },
    order: { id: 'ASC' },
  });
  const inActiveQueueItems = await cqRepo.find({
    where: { doctorId, isActive: false },
    take: limit,
    order: { id: 'DESC' },
  });

  inActiveQueueItems.reverse();
  let dbConsultQueue: ConsultQueueItem[] = [...activeQueueItems, ...inActiveQueueItems];

  //Get all the appointments of the queue items
  const appointmentIds = dbConsultQueue.map((queueItem) => queueItem.appointmentId);
  const appointments = await apptRepo.getAppointmentsByIds(appointmentIds);

  //Map the appointments with appointment ids
  const appointmentIdMapper: { [key: string]: Appointment } = {};
  const patientIds: string[] = [];
  const appointmentIdsToRemove: string[] = [];
  appointments.forEach((appointment) => {
    if (appointment.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE) {
      appointmentIdsToRemove.push(appointment.id);
    } else {
      appointmentIdMapper[appointment.id] = appointment;
      patientIds.push(appointment.patientId);
    }
  });
  //Filter all the appointments with AWAITING_RESCHEDULE state
  dbConsultQueue = dbConsultQueue.filter(
    (queueItem) => !appointmentIdsToRemove.includes(queueItem.appointmentId)
  );
  //Get all the patients of the queue items
  const patients = await patRepo.getPatientDetailsByIds(patientIds);

  //Map the patients with patient ids
  const patientIdMapper: { [key: string]: Patient } = {};
  patients.forEach((patient) => {
    patientIdMapper[patient.id] = patient;
  });

  //Create the response object with queue items
  const consultQueue = dbConsultQueue.map((queueItem) => {
    const { id, isActive, appointmentId } = queueItem;
    return {
      id,
      isActive,
      appointment: appointmentIdMapper[appointmentId],
      patient: patientIdMapper[appointmentIdMapper[appointmentId].patientId],
    };
  });
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
  const { docRepo, mobileNumber } = getRepos(context);
  await checkAuth(docRepo, mobileNumber, doctorId);
  const consultQueue = await buildGqlConsultQueue(doctorId, context);
  return { consultQueue };
};

type AddToConsultQueueInput = { appointmentId: string };
type AddToConsultQueueResult = {
  id: number;
  doctorId: string;
  totalJuniorDoctors: number;
  totalJuniorDoctorsOnline: number;
  juniorDoctorsList: JuniorDoctorsList[];
};
type JuniorDoctorsList = {
  juniorDoctorId: string;
  doctorName: string;
  queueCount: number;
};

const addToConsultQueue: Resolver<
  null,
  AddToConsultQueueInput,
  ConsultServiceContext,
  AddToConsultQueueResult
> = async (parent, { appointmentId }, context) => {
  const { cqRepo, docRepo, apptRepo, caseSheetRepo } = getRepos(context);
  await apptRepo.findOneOrFail(appointmentId);
  const juniorDoctorsList: JuniorDoctorsList[] = [];
  const juniorDoctorCaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(appointmentId);
  if (juniorDoctorCaseSheet != null) {
    const queueResult: AddToConsultQueueResult = {
      id: 0,
      doctorId: '',
      totalJuniorDoctors: 0,
      totalJuniorDoctorsOnline: 0,
      juniorDoctorsList,
    };
    return queueResult;
  }

  const existingQueueItem = await cqRepo.findOne({ appointmentId });
  if (existingQueueItem) throw new AphError(AphErrorMessages.APPOINTMENT_ALREADY_IN_CONSULT_QUEUE);

  const juniorDoctors = await docRepo.find({
    doctorType: DoctorType.JUNIOR,
    isActive: true,
  });
  //Get online JDs
  const onlineJuniorDoctors = juniorDoctors.filter(
    (doctor) => doctor.onlineStatus == DOCTOR_ONLINE_STATUS.ONLINE
  );
  if (!onlineJuniorDoctors.length) throw new AphError(AphErrorMessages.NO_ONLINE_DOCTORS);

  const onlineJuniorDoctorIds = onlineJuniorDoctors.map((doctor) => doctor.id);
  //Get queue items of online JDs
  const consultQueueItems = await cqRepo.getQueueItemsByDoctorIds(onlineJuniorDoctorIds);

  //Map and get the count of queue items of each online JD
  const jdQueueCounts: { [key: string]: number } = {};
  consultQueueItems.map((queueItem) => {
    if (jdQueueCounts[queueItem.doctorId]) {
      jdQueueCounts[queueItem.doctorId] = jdQueueCounts[queueItem.doctorId] + 1;
    } else {
      jdQueueCounts[queueItem.doctorId] = 1;
    }
  });
  onlineJuniorDoctorIds.map((id) => {
    if (!jdQueueCounts[id]) {
      jdQueueCounts[id] = 0;
    }
  });

  let jdActiveAppointmentsCount = -1;
  let doctorId = '';
  //Map the object and find the JD with least queue item count
  Object.keys(jdQueueCounts).map((key) => {
    if (jdActiveAppointmentsCount == -1 || jdQueueCounts[key] < jdActiveAppointmentsCount) {
      jdActiveAppointmentsCount = jdQueueCounts[key];
      doctorId = key;
    }
  });

  const { id } = await cqRepo.save(cqRepo.create({ appointmentId, doctorId, isActive: true }));
  await apptRepo.updateConsultStarted(appointmentId, true);

  //create the juniorDoctorsList object
  onlineJuniorDoctors.map((doctor) => {
    const details = {
      doctorName: doctor.firstName + ' ' + doctor.lastName,
      juniorDoctorId: doctor.id,
      queueCount: jdQueueCounts[doctor.id],
    };
    juniorDoctorsList.push(details);
  });

  return {
    id,
    doctorId,
    totalJuniorDoctors: juniorDoctors.length,
    totalJuniorDoctorsOnline: onlineJuniorDoctors.length,
    juniorDoctorsList,
  };
};

type RemoveFromConsultQueueInput = { id: number };
type RemoveFromConsultQueueResult = { consultQueue: GqlConsultQueue };
const removeFromConsultQueue: Resolver<
  null,
  RemoveFromConsultQueueInput,
  ConsultServiceContext,
  RemoveFromConsultQueueResult
> = async (parent, { id }, context) => {
  const { docRepo, cqRepo, mobileNumber, caseSheetRepo } = getRepos(context);
  const consultQueueItemToDeactivate = await cqRepo.findOneOrFail(id);
  const { doctorId, appointmentId } = consultQueueItemToDeactivate;
  await checkAuth(docRepo, mobileNumber, doctorId);
  await caseSheetRepo.updateJDCaseSheet(appointmentId);
  await cqRepo.update(consultQueueItemToDeactivate.id, { isActive: false });
  const consultQueue = await buildGqlConsultQueue(doctorId, context);
  return { consultQueue };
};

type ConsultQueueInput = {
  appointmentId: string;
  height: string;
  weight: string;
  temperature: string;
  bp: string;
  lifeStyle: string;
  familyHistory: string;
  dietAllergies: string;
  drugAllergies: string;
};

type ConsultQueueInputArgs = {
  consultQueueInput: ConsultQueueInput;
};

const addToConsultQueueWithAutomatedQuestions: Resolver<
  null,
  ConsultQueueInputArgs,
  ConsultServiceContext,
  AddToConsultQueueResult
> = async (parent, { consultQueueInput }, context) => {
  const appointmentId = consultQueueInput.appointmentId;

  const { cqRepo, docRepo, apptRepo, caseSheetRepo } = getRepos(context);
  const appointmentData = await apptRepo.findOneOrFail(appointmentId);
  const jrDocList: JuniorDoctorsList[] = [];
  const juniorDoctorCaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(appointmentId);
  if (juniorDoctorCaseSheet != null) {
    const queueResult: AddToConsultQueueResult = {
      id: 0,
      doctorId: '',
      totalJuniorDoctors: 0,
      totalJuniorDoctorsOnline: 0,
      juniorDoctorsList: jrDocList,
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
  const juniorDocs = await docRepo.find({
    doctorType: DoctorType.JUNIOR,
    isActive: true,
  });
  let doctorId: string = '0';
  const nextDoctorId = await cqRepo.getNextJuniorDoctor(context.doctorsDb);
  if (nextDoctorId && nextDoctorId != '0') {
    doctorId = nextDoctorId;
  } else {
    throw new AphError(AphErrorMessages.NO_ONLINE_DOCTORS);
  }
  const { id } = await cqRepo.save(cqRepo.create({ appointmentId, doctorId, isActive: true }));
  await apptRepo.updateConsultStarted(appointmentId, true);

  //automated questions starts
  const patientRepo = context.patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.getPatientDetails(appointmentData.patientId);
  if (patientData == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //familyHistory upsert starts
  if (!(consultQueueInput.familyHistory === undefined)) {
    const familyHistoryInputs: Partial<PatientFamilyHistory> = {
      patient: patientData,
      description:
        consultQueueInput.familyHistory.length > 0 ? consultQueueInput.familyHistory : undefined,
    };
    const familyHistoryRepo = context.patientsDb.getCustomRepository(
      PatientFamilyHistoryRepository
    );
    const familyHistoryRecord = await familyHistoryRepo.getPatientFamilyHistory(
      appointmentData.patientId
    );

    if (familyHistoryRecord == null) {
      //create
      await familyHistoryRepo.savePatientFamilyHistory(familyHistoryInputs);
    } else {
      //update
      await familyHistoryRepo.updatePatientFamilyHistory(
        familyHistoryRecord.id,
        familyHistoryInputs
      );
    }
  }
  //familyHistory upsert ends

  //lifestyle upsert starts
  if (!(consultQueueInput.lifeStyle === undefined)) {
    const lifeStyleInputs: Partial<PatientLifeStyle> = {
      patient: patientData,
      description: consultQueueInput.lifeStyle.length > 0 ? consultQueueInput.lifeStyle : undefined,
    };
    const lifeStyleRepo = context.patientsDb.getCustomRepository(PatientLifeStyleRepository);
    const lifeStyleRecord = await lifeStyleRepo.getPatientLifeStyle(appointmentData.patientId);

    if (lifeStyleRecord == null) {
      //create
      await lifeStyleRepo.savePatientLifeStyle(lifeStyleInputs);
    } else {
      //update
      await lifeStyleRepo.updatePatientLifeStyle(lifeStyleRecord.id, lifeStyleInputs);
    }
  }
  //lifestyle upsert ends

  //medicalHistory upsert starts
  const medicalHistoryInputs: Partial<PatientMedicalHistory> = {
    patient: patientData,
  };

  if (!(consultQueueInput.bp === undefined))
    medicalHistoryInputs.bp = consultQueueInput.bp.length > 0 ? consultQueueInput.bp : undefined;

  if (!(consultQueueInput.weight === undefined))
    medicalHistoryInputs.weight =
      consultQueueInput.weight.length > 0 ? consultQueueInput.weight : undefined;

  if (!(consultQueueInput.temperature === undefined))
    medicalHistoryInputs.temperature =
      consultQueueInput.temperature.length > 0 ? consultQueueInput.temperature : undefined;

  if (!(consultQueueInput.height === undefined))
    medicalHistoryInputs.height = consultQueueInput.height;
  if (!(consultQueueInput.drugAllergies === undefined))
    medicalHistoryInputs.drugAllergies =
      consultQueueInput.drugAllergies.length > 0 ? consultQueueInput.drugAllergies : undefined;

  if (!(consultQueueInput.dietAllergies === undefined))
    medicalHistoryInputs.dietAllergies =
      consultQueueInput.dietAllergies.length > 0 ? consultQueueInput.dietAllergies : undefined;

  const medicalHistoryRepo = context.patientsDb.getCustomRepository(
    PatientMedicalHistoryRepository
  );
  const medicalHistoryRecord = await medicalHistoryRepo.getPatientMedicalHistory(
    appointmentData.patientId
  );
  if (medicalHistoryRecord == null) {
    //create
    await medicalHistoryRepo.savePatientMedicalHistory(medicalHistoryInputs);
  } else {
    //update
    await medicalHistoryRepo.updatePatientMedicalHistory(
      medicalHistoryRecord.id,
      medicalHistoryInputs
    );
  }
  //medicalHistory upsert ends
  //automated questions ends

  function getJuniorDocInfo() {
    return new Promise(async (resolve, reject) => {
      onlineJrDocs.map(async (doctor) => {
        const queueCount = await cqRepo.count({ where: { doctorId: doctor.id, isActive: true } });
        const jrDoctor: JuniorDoctorsList = {
          doctorName: doctor.firstName + ' ' + doctor.lastName,
          juniorDoctorId: doctor.id,
          queueCount,
        };
        jrDocList.push(jrDoctor);
        if (jrDocList.length == onlineJrDocs.length) {
          resolve(jrDocList);
        }
      });
    });
  }
  if (onlineJrDocs.length > 0) {
    await getJuniorDocInfo();
  }
  // update JdQuestionStatus
  await apptRepo.updateJdQuestionStatus(appointmentId, true);

  return {
    id,
    doctorId,
    totalJuniorDoctors: juniorDocs.length,
    totalJuniorDoctorsOnline: onlineJrDocs.length,
    juniorDoctorsList: jrDocList,
  };
};

export const consultQueueResolvers = {
  Query: {
    getConsultQueue,
  },
  Mutation: {
    addToConsultQueue,
    removeFromConsultQueue,
    addToConsultQueueWithAutomatedQuestions,
  },
};
