import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { CaseSheet, Appointment } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Patient } from 'profiles-service/entities';
import { Timestamp } from 'typeorm';

export const caseSheetTypeDefs = gql`
  enum ConsultMode {
    ONLINE
    PHYSICAL
    BOTH
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  enum MEDICINE_TIMINGS {
    EVENING
    MORNING
    NIGHT
    NOON
  }

  enum MEDICINE_TO_BE_TAKEN {
    AFTER_FOOD
    BEFORE_FOOD
  }

  enum Relation {
    ME
    MOTHER
    FATHER
    SISTER
    BROTHER
    COUSIN
    WIFE
    HUSBAND
    OTHER
  }

  input CaseSheetInput {
    appointmentId: String
    createdDoctorId: String
  }

  type AppointmentId {
    id: String
  }

  type CaseSheetFullDetails {
    caseSheetDetails: CaseSheet
    patientDetails: PatientDetails
  }

  type CaseSheet {
    appointment: AppointmentId
    consultType: String
    diagnosis: String
    diagnosisPrescription: String
    doctorId: String
    followUp: Boolean
    followUpAfterInDays: String
    followUpDate: String
    id: String
    medicinePrescription: [MedicinePrescription]
    notes: String
    otherInstructions: [OtherInstructions]
    patientId: String
    symptoms: [SymptomList]
  }

  type MedicinePrescription {
    medicineConsumptionDurationInDays: String
    medicineDosage: String
    medicineInstructions: String
    medicineTimings: MEDICINE_TIMINGS
    medicineToBeTaken: MEDICINE_TO_BE_TAKEN
    medicineName: String
    id: String
  }

  type OtherInstructions {
    instruction: String
  }

  type PatientDetails {
    allergies: String
    dateOfBirth: Date
    emailAddress: String
    firstName: String
    familyHistory: [PatientFamilyHistory]
    gender: Gender
    healthVault: [PatientHealthVault]
    id: ID!
    lastName: String
    lifeStyle: [PatientLifeStyle]
    mobileNumber: String
    photoUrl: String
    uhid: String
    relation: Relation
  }

  type PatientLifeStyle {
    description: String
  }

  type PatientHealthVault {
    imageUrls: String
    reportUrls: String
  }

  type PatientFamilyHistory {
    description: String
    relation: String
  }

  type SymptomList {
    symptom: String
    since: String
    howOften: String
    severity: String
  }

  extend type Mutation {
    createCaseSheet(CaseSheetInput: CaseSheetInput): CaseSheet
  }

  extend type Query {
    getJuniorDoctorCaseSheet(appointmentId: String): CaseSheetFullDetails
  }
`;

type CaseSheetInput = {
  appointmentId: string;
  createdDoctorId: string;
};

type caseSheetInputArgs = { CaseSheetInput: CaseSheetInput };
const createCaseSheet: Resolver<
  null,
  caseSheetInputArgs,
  ConsultServiceContext,
  CaseSheet
> = async (parent, { CaseSheetInput }, { consultsDb, doctorsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);

  //check appointmnet id
  const appointmentData = await appointmentRepo.findById(CaseSheetInput.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //check createdByDoctor id
  if (CaseSheetInput.createdDoctorId.length > 0) {
    const doctordata = await doctorRepository.getDoctorProfileData(CaseSheetInput.createdDoctorId);
    if (doctordata == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
  }

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const appointment: Partial<Appointment> = {
    id: CaseSheetInput.appointmentId,
  };
  const caseSheetAttrs: Partial<CaseSheet> = {
    ...CaseSheetInput,
    consultType: appointmentData.appointmentType,
    doctorId: appointmentData.doctorId,
    patientId: appointmentData.patientId,
    appointment: <Appointment>appointment,
  };
  return await caseSheetRepo.savecaseSheet(caseSheetAttrs);
};

const getJuniorDoctorCaseSheet: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  {
    caseSheetDetails: CaseSheet;
    patientDetails: Patient;
  }
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  //check appointmnet id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get casesheet data
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetDetails = await caseSheetRepo.getJuniorDoctorCaseSheet(args.appointmentId);
  if (caseSheetDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get patient info
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointmentData.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  return { caseSheetDetails, patientDetails };
};

type UpdateCaseSheetInput = {
  symptoms: JSON;
  notes: string;
  diagnosis: JSON;
  diagnosticPrescription: JSON;
  followUp: string;
  followUpDate: Timestamp;
  followUpAfterInDays: number;
  otherInstructions: JSON;
  medicinePrescription: JSON;
  id: string;
};
const updateCaseSheet: Resolver<null, {}, ConsultServiceContext, string> = async (
  parent,
  args,
  { consultsDb }
) => {
  return '';
};

export const caseSheetResolvers = {
  Mutation: {
    createCaseSheet,
    updateCaseSheet,
  },

  Query: { getJuniorDoctorCaseSheet },
};
