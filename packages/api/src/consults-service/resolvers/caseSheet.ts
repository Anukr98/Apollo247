import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { CaseSheet, Appointment } from 'consults-service/entities';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Patient } from 'profiles-service/entities';
import { DiagnosisData } from 'consults-service/data/diagnosis';
import { DiagnosticData } from 'consults-service/data/diagnostics';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import {
  convertCaseSheetToRxPdfData,
  generateRxPdfDocument,
  uploadRxPdf,
} from 'consults-service/rxPdfGenerator';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

export type DiagnosisJson = {
  name: string;
  id: string;
};

export type DiagnosticJson = {
  itemid: string;
  itemname: string;
  itemcode: string;
  ItemAliasName: string;
  FromAgeInDays: number;
  ToAgeInDays: number;
  Gender: string;
  LabName: string;
  LabCode: string;
  LabID: number;
  Rate: number;
  ScheduleRate: number;
  FromDate: string;
  ToDate: string;
  ItemType: string;
  TestInPackage: number;
  NABL_CAP: string;
  ItemRemarks: string;
  Discounted: string;
};

export const caseSheetTypeDefs = gql`
  enum DoctorType {
    APOLLO
    PAYROLL
    STAR_APOLLO
    JUNIOR
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

  type Appointment {
    id: String!
    appointmentDateTime: DateTime!
    appointmentState: String
    appointmentType: APPOINTMENT_TYPE!
    displayId: String!
    doctorId: String!
    hospitalId: String
    patientId: String!
    parentId: String
    status: STATUS!
    rescheduleCount: Int!
    isFollowUp: Int!
    followUpParentId: String
    isTransfer: Int!
    transferParentId: String
    caseSheet: [CaseSheet!]
    doctorInfo: Profile @provides(fields: "id")
  }

  type CaseSheetFullDetails {
    caseSheetDetails: CaseSheet
    patientDetails: PatientDetails
    pastAppointments: [Appointment]
    juniorDoctorNotes: String
  }

  type CaseSheet {
    appointment: Appointment
    blobName: String
    consultType: String
    diagnosis: [Diagnosis]
    diagnosticPrescription: [DiagnosticPrescription]
    doctorId: String
    doctorType: DoctorType
    followUp: Boolean
    followUpAfterInDays: String
    followUpDate: DateTime
    id: String
    medicinePrescription: [MedicinePrescription]
    notes: String
    otherInstructions: [OtherInstructions]
    patientId: String
    symptoms: [SymptomList]
  }

  type Diagnosis {
    name: String
  }

  type DiagnosticPrescription {
    itemname: String
  }

  type MedicinePrescription {
    medicineConsumptionDurationInDays: String
    medicineDosage: String
    medicineInstructions: String
    medicineTimings: [MEDICINE_TIMINGS]
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineName: String
    id: String
  }

  type OtherInstructions {
    instruction: String
  }

  type Address {
    id: ID!
    addressLine1: String
    addressLine2: String
    city: String
    mobileNumber: String
    state: String
    zipcode: String
    landmark: String
    createdDate: Date
    updatedDate: Date
  }

  type PatientDetails {
    patientAddress: [Address]
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

  input UpdateCaseSheetInput {
    symptoms: String
    notes: String
    diagnosis: String
    diagnosticPrescription: String
    followUp: Boolean
    followUpDate: String
    followUpAfterInDays: String
    otherInstructions: String
    medicinePrescription: String
    id: String
  }

  type DiagnosisJson {
    name: String
    id: String
  }

  type DiagnosticJson {
    itemid: String
    itemname: String
    itemcode: String
    ItemAliasName: String
    FromAgeInDays: Int
    ToAgeInDays: Int
    Gender: String
    LabName: String
    LabCode: String
    LabID: Int
    Rate: Int
    ScheduleRate: Int
    FromDate: String
    ToDate: String
    ItemType: String
    TestInPackage: String
    NABL_CAP: String
    ItemRemarks: String
    Discounted: String
  }

  extend type Mutation {
    updateCaseSheet(UpdateCaseSheetInput: UpdateCaseSheetInput): CaseSheet
    createJuniorDoctorCaseSheet(appointmentId: String): CaseSheet
    createSeniorDoctorCaseSheet(appointmentId: String): CaseSheet
  }

  extend type Query {
    getCaseSheet(appointmentId: String): CaseSheetFullDetails
    getJuniorDoctorCaseSheet(appointmentId: String): CaseSheetFullDetails
    searchDiagnosis(searchString: String): [DiagnosisJson]
    searchDiagnostic(searchString: String): [DiagnosticJson]
  }
`;

const getJuniorDoctorCaseSheet: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  {
    caseSheetDetails: CaseSheet;
    patientDetails: Patient;
    pastAppointments: Appointment[];
  }
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  //check appointment id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get loggedin user details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //get junior doctor case-sheet
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetDetails = await caseSheetRepo.getJuniorDoctorCaseSheet(args.appointmentId);
  if (caseSheetDetails == null) throw new AphError(AphErrorMessages.NO_CASESHEET_EXIST);

  //get patient info
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointmentData.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //get past appointment details
  const pastAppointments = await appointmentRepo.getPastAppointments(
    appointmentData.doctorId,
    appointmentData.patientId
  );

  return { caseSheetDetails, patientDetails, pastAppointments };
};

const getCaseSheet: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  {
    caseSheetDetails: CaseSheet;
    patientDetails: Patient;
    pastAppointments: Appointment[];
    juniorDoctorNotes: string;
  }
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  //check appointment id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get loggedin user details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  let juniorDoctorNotes = '';

  //check whether there is a senior doctor case-sheet
  const caseSheetDetails = await caseSheetRepo.getSeniorDoctorCaseSheet(appointmentData.id);
  if (caseSheetDetails == null) throw new AphError(AphErrorMessages.NO_CASESHEET_EXIST);
  juniorDoctorNotes = caseSheetDetails.notes;

  //get patient info
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointmentData.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //get past appointment details
  const pastAppointments = await appointmentRepo.getPastAppointments(
    appointmentData.doctorId,
    appointmentData.patientId
  );

  return { caseSheetDetails, patientDetails, pastAppointments, juniorDoctorNotes };
};

type UpdateCaseSheetInput = {
  symptoms: string;
  notes: string;
  diagnosis: string;
  diagnosticPrescription: string;
  followUp: boolean;
  followUpDate: string;
  followUpAfterInDays: string;
  otherInstructions: string;
  medicinePrescription: string;
  id: string;
};

type UpdateCaseSheetInputArgs = { UpdateCaseSheetInput: UpdateCaseSheetInput };

const updateCaseSheet: Resolver<
  null,
  UpdateCaseSheetInputArgs,
  ConsultServiceContext,
  CaseSheet
> = async (parent, { UpdateCaseSheetInput }, { consultsDb, doctorsDb }) => {
  const inputArguments = JSON.parse(JSON.stringify(UpdateCaseSheetInput));

  //validate date
  if (
    inputArguments.followUpDate.length > 0 &&
    isNaN(new Date(inputArguments.followUpDate).valueOf())
  )
    throw new AphError(AphErrorMessages.INVALID_DATE_FORMAT);

  const followUpAfterInDays =
    inputArguments.followUpAfterInDays == '' ? 0 : <Number>inputArguments.followUpAfterInDays;
  const followUpDate = inputArguments.followUpDate == '' ? null : <Date>inputArguments.followUpDate;

  //validate casesheetid
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const getCaseSheetData = await caseSheetRepo.getCaseSheetById(inputArguments.id);
  if (getCaseSheetData == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  const caseSheetAttrs: Omit<Partial<CaseSheet>, 'id'> = {
    ...inputArguments,
    symptoms: JSON.parse(inputArguments.symptoms),
    diagnosis: JSON.parse(inputArguments.diagnosis),
    diagnosticPrescription: JSON.parse(inputArguments.diagnosticPrescription),
    otherInstructions: JSON.parse(inputArguments.otherInstructions),
    medicinePrescription: JSON.parse(inputArguments.medicinePrescription),
    followUpDate: followUpDate,
    followUpAfterInDays: followUpAfterInDays,
  };

  await caseSheetRepo.updateCaseSheet(inputArguments.id, caseSheetAttrs);

  const getUpdatedCaseSheet = await caseSheetRepo.getCaseSheetById(inputArguments.id);
  if (getUpdatedCaseSheet == null) throw new AphError(AphErrorMessages.UPDATE_CASESHEET_ERROR);

  //convert casesheet to prescription
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );
  const rxPdfData = await convertCaseSheetToRxPdfData(getUpdatedCaseSheet, doctorsDb);
  const pdfDocument = generateRxPdfDocument(rxPdfData);
  const blob = await uploadRxPdf(client, inputArguments.id, pdfDocument);
  if (blob == null) throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  caseSheetRepo.updateCaseSheet(getUpdatedCaseSheet.id, { blobName: blob.name });

  getUpdatedCaseSheet.blobName = blob.name;

  return getUpdatedCaseSheet;
};

const searchDiagnosis: Resolver<
  null,
  { searchString: string },
  ConsultServiceContext,
  DiagnosisJson[]
> = async (parent, args, { consultsDb }) => {
  const result = DiagnosisData.filter((obj) =>
    obj.name.toLowerCase().startsWith(args.searchString.toLowerCase())
  );
  return result;
};

const searchDiagnostic: Resolver<
  null,
  { searchString: string },
  ConsultServiceContext,
  DiagnosticJson[]
> = async (parent, args, { consultsDb }) => {
  const result = DiagnosticData.filter((obj) =>
    obj.itemname.toLowerCase().startsWith(args.searchString.toLowerCase())
  );
  return result;
};

const createJuniorDoctorCaseSheet: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  CaseSheet
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb }) => {
  //check appointment id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  let caseSheetDetails;

  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get loggedin user details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);

  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  if (doctorData.doctorType != 'JUNIOR') throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //check if junior doctor case-sheet exists already
  caseSheetDetails = await caseSheetRepo.getJuniorDoctorCaseSheet(args.appointmentId);
  if (caseSheetDetails != null) return caseSheetDetails;

  const caseSheetAttrs: Partial<CaseSheet> = {
    consultType: appointmentData.appointmentType,
    doctorId: appointmentData.doctorId,
    patientId: appointmentData.patientId,
    appointment: appointmentData,
    createdDoctorId: doctorData.id,
    doctorType: doctorData.doctorType,
  };
  caseSheetDetails = await caseSheetRepo.savecaseSheet(caseSheetAttrs);
  return caseSheetDetails;
};

const createSeniorDoctorCaseSheet: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  CaseSheet
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb }) => {
  //get loggedin user details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  if (doctorData.doctorType == 'JUNIOR') throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //get appointment details
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const juniorDoctorcaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(args.appointmentId);
  if (juniorDoctorcaseSheet == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  //check whether if senior doctors casesheet already exists
  let caseSheetDetails;
  caseSheetDetails = await caseSheetRepo.getSeniorDoctorCaseSheet(args.appointmentId);

  if (caseSheetDetails == null) {
    const caseSheetAttrs: Partial<CaseSheet> = {
      diagnosis: juniorDoctorcaseSheet.diagnosis,
      diagnosticPrescription: juniorDoctorcaseSheet.diagnosticPrescription,
      followUp: juniorDoctorcaseSheet.followUp,
      followUpAfterInDays: juniorDoctorcaseSheet.followUpAfterInDays,
      followUpDate: juniorDoctorcaseSheet.followUpDate,
      otherInstructions: juniorDoctorcaseSheet.otherInstructions,
      symptoms: juniorDoctorcaseSheet.symptoms,
      consultType: appointmentData.appointmentType,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      appointment: appointmentData,
      createdDoctorId: appointmentData.doctorId,
      doctorType: doctorData.doctorType,
    };
    caseSheetDetails = await caseSheetRepo.savecaseSheet(caseSheetAttrs);
  }
  return caseSheetDetails;
};

export const caseSheetResolvers = {
  Appointment: {
    doctorInfo(appointments: Appointment) {
      return { __typename: 'Profile', id: appointments.doctorId };
    },
  },
  Mutation: {
    updateCaseSheet,
    createJuniorDoctorCaseSheet,
    createSeniorDoctorCaseSheet,
  },

  Query: {
    getCaseSheet,
    getJuniorDoctorCaseSheet,
    searchDiagnosis,
    searchDiagnostic,
  },
};
