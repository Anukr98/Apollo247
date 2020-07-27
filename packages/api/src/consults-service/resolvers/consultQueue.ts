import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import {
  Patient,
  PatientFamilyHistory,
  PatientLifeStyle,
  PatientMedicalHistory,
  Gender,
} from 'profiles-service/entities';
import {
  CASESHEET_STATUS,
  Appointment,
  ConsultQueueItem,
  APPOINTMENT_STATE,
  AppointmentUpdateHistory,
  APPOINTMENT_UPDATED_BY,
  VALUE_TYPE,
  STATUS,
} from 'consults-service/entities';
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
import { ApiConstants } from 'ApiConstants';
import { format, subYears } from 'date-fns';

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
    getConsultQueue(doctorId: String!, isActive: Boolean!): GetConsultQueueResult!
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
    isJdAllowed: Boolean
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
    age: Float
    gender: Gender
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
  isActive: boolean;
};

const getConsultQueue: Resolver<
  null,
  GetConsultQueueInput,
  ConsultServiceContext,
  GetConsultQueueResult
> = async (parent, { doctorId, isActive }, context) => {
  const { docRepo, cqRepo, mobileNumber, patRepo } = getRepos(context);
  await checkAuth(docRepo, mobileNumber, doctorId);
  let result: GetConsultQueueResult = { consultQueue: [] };
  let consultQueueItems: ConsultQueueItem[] = [];
  consultQueueItems = await cqRepo.getConsultQueue(doctorId, isActive);
  const patientIds = consultQueueItems.map(item => item.appointment.patientId);
  let patients: Patient[] = [];
  if (patientIds && patientIds.length > 0) {
    patients = await patRepo.getPatientDetailsByIds(patientIds);
  }
  let patient: Patient;
  consultQueueItems.map(item => {
    let res: GqlConsultQueueItem = {
      id: item.id,
      isActive: item.isActive,
      patient,
      appointment: item.appointment
    }
    result.consultQueue.push(res);
  });

  patients.map(patient => {
    result.consultQueue.map(item => {
      if (patient.id == item.appointment.patientId) {
        item.patient = patient;
      }
    })
  });
  return result;
};

type AddToConsultQueueInput = { appointmentId: string };
type AddToConsultQueueResult = {
  id: number;
  doctorId: string;
  totalJuniorDoctors: number;
  totalJuniorDoctorsOnline: number;
  juniorDoctorsList: JuniorDoctorsList[];
  isJdAllowed: Boolean;
};
type JuniorDoctorsList = {
  juniorDoctorId: string;
  doctorName: string;
  queueCount: number;
};

//This is not being used now. Refer to addToConsultQueueWithAutomatedQuestions
const addToConsultQueue: Resolver<
  null,
  AddToConsultQueueInput,
  ConsultServiceContext,
  AddToConsultQueueResult
> = async (parent, { appointmentId }, context) => {
  const { cqRepo, docRepo, apptRepo, caseSheetRepo } = getRepos(context);
  const apptDetails = await apptRepo.findOneOrFail(appointmentId);

  const jrDocList: JuniorDoctorsList[] = [];
  const juniorDoctorCaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(appointmentId);

  if (juniorDoctorCaseSheet != null) {
    const queueResult: AddToConsultQueueResult = {
      id: 0,
      doctorId: '',
      totalJuniorDoctors: 0,
      totalJuniorDoctorsOnline: 0,
      juniorDoctorsList: jrDocList,
      isJdAllowed: true,
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
  await apptRepo.updateConsultStarted(appointmentId, true, apptDetails);

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

  return {
    id,
    doctorId,
    totalJuniorDoctors: juniorDocs.length,
    totalJuniorDoctorsOnline: onlineJrDocs.length,
    juniorDoctorsList: jrDocList,
    isJdAllowed: true,
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
  age?: number;
  gender?: Gender;
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
  const doctorRepo = context.doctorsDb.getCustomRepository(DoctorRepository);
  const doctorDetails = await doctorRepo.findById(appointmentData.doctorId);
  const isJdAllowed = doctorDetails ? doctorDetails.isJdAllowed : true;
  const juniorDoctorCaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(appointmentId);
  if (juniorDoctorCaseSheet != null) {
    const queueResult: AddToConsultQueueResult = {
      id: 0,
      doctorId: '',
      totalJuniorDoctors: 0,
      totalJuniorDoctorsOnline: 0,
      juniorDoctorsList: jrDocList,
      isJdAllowed,
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
  // if (!onlineJuniorDoctors.length) throw new AphError(AphErrorMessages.NO_ONLINE_DOCTORS);
  let queueId = 0;
  const virtualJDId = process.env.VIRTUAL_JD_ID;
  const createdDate = new Date();
  let doctorId = '';
  const jdQueueCounts: { [key: string]: number } = {};
  //create jd casesheet if isjdallowed is false
  if (isJdAllowed == false) {
    const consultQueueAttrs = {
      appointmentId: appointmentData.id,
      createdDate: createdDate,
      doctorId: virtualJDId,
      isActive: false,
    };
    const { id } = await cqRepo.save(cqRepo.create(consultQueueAttrs));
    queueId = id;
    doctorId = virtualJDId;
    //Insert case sheet record
    const casesheetAttrs = {
      createdDate: new Date(),
      consultType: appointmentData.appointmentType,
      createdDoctorId: process.env.VIRTUAL_JD_ID,
      doctorType: DoctorType.JUNIOR,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      appointment: appointmentData,
      status: CASESHEET_STATUS.COMPLETED,
      notes:
        isJdAllowed === false
          ? ApiConstants.NOT_APPLICABLE
          : ApiConstants.APPOINTMENT_BOOKED_WITHIN_10_MIN.toString().replace(
            '{0}',
            ApiConstants.AUTO_SUBMIT_CASESHEET_TIME_APPOINMENT.toString()
          ),
      isJdConsultStarted: true,
    };
    caseSheetRepo.savecaseSheet(casesheetAttrs);
    apptRepo.updateJdQuestionStatusbyIds([appointmentData.id]);
    const historyAttrs: Partial<AppointmentUpdateHistory> = {
      appointment: appointmentData,
      userType: APPOINTMENT_UPDATED_BY.PATIENT,
      fromValue: STATUS.PENDING,
      toValue: STATUS.PENDING,
      valueType: VALUE_TYPE.STATUS,
      userName: appointmentData.patientId,
      reason:
        ApiConstants.CONSULT_QUEUE_HISTORY2.toString() +
        ', virtual JD ID:' +
        process.env.VIRTUAL_JD_ID,
    };
    apptRepo.saveAppointmentHistory(historyAttrs);
  } else if (onlineJuniorDoctors.length) {
    const onlineJuniorDoctorIds = onlineJuniorDoctors.map((doctor) => doctor.id);
    //Get queue items of online JDs
    const consultQueueItems = await cqRepo.getQueueItemsByDoctorIds(onlineJuniorDoctorIds);

    //Map and get the count of queue items of each online JD
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
    //Map the object and find the JD with least queue item count
    Object.keys(jdQueueCounts).map((key) => {
      if (jdActiveAppointmentsCount == -1 || jdQueueCounts[key] < jdActiveAppointmentsCount) {
        jdActiveAppointmentsCount = jdQueueCounts[key];
        doctorId = key;
      }
    });

    const { id } = await cqRepo.save(cqRepo.create({ appointmentId, doctorId, isActive: true }));
    queueId = id;
    const historyAttrs: Partial<AppointmentUpdateHistory> = {
      appointment: appointmentData,
      userType: APPOINTMENT_UPDATED_BY.PATIENT,
      fromValue: STATUS.PENDING,
      toValue: STATUS.PENDING,
      valueType: VALUE_TYPE.STATUS,
      userName: appointmentData.patientId,
      reason: ApiConstants.CONSULT_QUEUE_HISTORY.toString() + ', assigned JD: ' + doctorId,
    };
    apptRepo.saveAppointmentHistory(historyAttrs);
  } else {
    const consultQueueAttrs = {
      appointmentId: appointmentData.id,
      createdDate: createdDate,
      doctorId: virtualJDId,
      isActive: false,
    };
    const { id } = await cqRepo.save(cqRepo.create(consultQueueAttrs));
    queueId = id;
    doctorId = virtualJDId;
    const casesheetAttrs = {
      createdDate: createdDate,
      consultType: appointmentData.appointmentType,
      createdDoctorId: process.env.VIRTUAL_JD_ID,
      doctorType: DoctorType.JUNIOR,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      appointment: appointmentData,
      status: CASESHEET_STATUS.COMPLETED,
      notes: ApiConstants.NO_JD_AVAILABLE_TEXT.toString(),
      isJdConsultStarted: true,
    };
    caseSheetRepo.savecaseSheet(casesheetAttrs);
    const historyAttrs: Partial<AppointmentUpdateHistory> = {
      appointment: appointmentData,
      userType: APPOINTMENT_UPDATED_BY.PATIENT,
      fromValue: STATUS.PENDING,
      toValue: STATUS.PENDING,
      valueType: VALUE_TYPE.STATUS,
      userName: appointmentData.patientId,
      reason:
        ApiConstants.CONSULT_QUEUE_HISTORY1.toString() +
        ', virtual JD ID:' +
        process.env.VIRTUAL_JD_ID,
    };
    apptRepo.saveAppointmentHistory(historyAttrs);
  }

  apptRepo.updateJdQuestionStatusbyIds([appointmentId]);

  //automated questions starts
  const patientRepo = context.patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.getPatientDetails(appointmentData.patientId);
  if (patientData == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  const {
    age,
    gender,
    familyHistory,
    lifeStyle,
    bp,
    weight,
    temperature,
    height,
    drugAllergies,
    dietAllergies,
  } = consultQueueInput;

  if (age || gender) {
    const patientAttrs: Partial<Patient> = { ...patientData };
    if (age) {
      const sampleDate = format(new Date(), 'yyyy-01-01');
      const dob = subYears(new Date(sampleDate), Math.floor(age));
      patientAttrs.dateOfBirth = dob;
    }
    if (gender) {
      patientAttrs.gender = gender;
    }
    delete patientAttrs.lifeStyle;
    delete patientAttrs.healthVault;
    delete patientAttrs.familyHistory;
    delete patientAttrs.patientAddress;
    delete patientAttrs.patientDeviceTokens;
    delete patientAttrs.patientNotificationSettings;
    delete patientAttrs.patientMedicalHistory;
    if (patientAttrs.id) patientRepo.updateProfile(patientAttrs.id, patientAttrs);
  }

  //familyHistory upsert starts
  if (!(familyHistory === undefined)) {
    const familyHistoryInputs: Partial<PatientFamilyHistory> = {
      patient: patientData,
      description: familyHistory.length > 0 ? familyHistory : undefined,
    };
    const familyHistoryRepo = context.patientsDb.getCustomRepository(
      PatientFamilyHistoryRepository
    );
    const familyHistoryRecord = patientData.familyHistory[0];

    if (familyHistoryRecord == null) {
      //create
      familyHistoryRepo.savePatientFamilyHistory(familyHistoryInputs);
    } else {
      //update
      familyHistoryRepo.updatePatientFamilyHistory(familyHistoryRecord.id, familyHistoryInputs);
    }
  }
  //familyHistory upsert ends

  //lifestyle upsert starts
  if (!(lifeStyle === undefined)) {
    const lifeStyleInputs: Partial<PatientLifeStyle> = {
      patient: patientData,
      description: lifeStyle.length > 0 ? lifeStyle : undefined,
    };
    const lifeStyleRepo = context.patientsDb.getCustomRepository(PatientLifeStyleRepository);
    const lifeStyleRecord = patientData.lifeStyle
      ? patientData.lifeStyle[0]
      : patientData.lifeStyle;

    if (lifeStyleRecord == null) {
      //create
      lifeStyleRepo.savePatientLifeStyle(lifeStyleInputs);
    } else {
      //update
      lifeStyleRepo.updatePatientLifeStyle(lifeStyleRecord.id, lifeStyleInputs);
    }
  }
  //lifestyle upsert ends

  //medicalHistory upsert starts
  const medicalHistoryInputs: Partial<PatientMedicalHistory> = {
    patient: patientData,
  };

  if (!(bp === undefined)) medicalHistoryInputs.bp = bp.length > 0 ? bp : undefined;

  if (!(weight === undefined)) medicalHistoryInputs.weight = weight.length > 0 ? weight : undefined;

  if (!(temperature === undefined))
    medicalHistoryInputs.temperature = temperature.length > 0 ? temperature : undefined;

  if (!(height === undefined)) medicalHistoryInputs.height = height;
  if (!(drugAllergies === undefined))
    medicalHistoryInputs.drugAllergies = drugAllergies.length > 0 ? drugAllergies : undefined;

  if (!(dietAllergies === undefined))
    medicalHistoryInputs.dietAllergies = dietAllergies.length > 0 ? dietAllergies : undefined;

  const medicalHistoryRepo = context.patientsDb.getCustomRepository(
    PatientMedicalHistoryRepository
  );
  const medicalHistoryRecord = patientData.patientMedicalHistory;
  if (medicalHistoryRecord == null) {
    //create
    medicalHistoryRepo.savePatientMedicalHistory(medicalHistoryInputs);
  } else {
    //update
    medicalHistoryRepo.updatePatientMedicalHistory(medicalHistoryRecord.id, medicalHistoryInputs);
  }
  //medicalHistory upsert ends
  //automated questions ends

  //create the juniorDoctorsList object
  onlineJuniorDoctors.map((doctor) => {
    const details = {
      doctorName: doctor.firstName + ' ' + doctor.lastName,
      juniorDoctorId: doctor.id,
      queueCount: jdQueueCounts[doctor.id],
    };
    jrDocList.push(details);
  });

  return {
    id: queueId,
    doctorId,
    totalJuniorDoctors: juniorDoctors.length,
    totalJuniorDoctorsOnline: onlineJuniorDoctors.length,
    juniorDoctorsList: jrDocList,
    isJdAllowed,
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
