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
import { DiagnosisData } from 'consults-service/data/diagnosis';
import { DiagnosticData } from 'consults-service/data/diagnostics';

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

  input CaseSheetInput {
    appointmentId: String
    createdDoctorId: String
  }

  type Appointment {
    id: String
    appointmentDateTime: DateTime
    appointmentState: String
    appointmentType: APPOINTMENT_TYPE
    doctorId: String
    hospitalId: String
    patientId: String
    parentId: String
    status: STATUS
    caseSheet: [CaseSheet]
  }

  type CaseSheetFullDetails {
    caseSheetDetails: CaseSheet
    patientDetails: PatientDetails
    pastAppointments: [Appointment]
    juniorDoctorNotes: String
  }

  type CaseSheet {
    appointment: Appointment
    consultType: String
    diagnosis: [Diagnosis]
    diagnosticPrescription: [DiagnosticPrescription]
    doctorId: String
    doctorType: DoctorType
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

  type Diagnosis {
    name: String
  }

  type DiagnosticPrescription {
    name: String
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
    createCaseSheet(CaseSheetInput: CaseSheetInput): CaseSheet
    updateCaseSheet(UpdateCaseSheetInput: UpdateCaseSheetInput): CaseSheet
  }

  extend type Query {
    getJuniorDoctorCaseSheet(appointmentId: String): CaseSheetFullDetails
    getCaseSheet(appointmentId: String): CaseSheetFullDetails
    searchDiagnosis(searchString: String): [DiagnosisJson]
    searchDiagnostic(searchString: String): [DiagnosticJson]
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

//TODO : remove afer getCaseSheet integration
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
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  //check appointmnet id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  let caseSheetDetails;
  let juniorDoctorNotes = '';

  //check whether there is a senior doctor case-sheet. Else get juniordoctor case-sheet
  caseSheetDetails = await caseSheetRepo.getSeniorDoctorCaseSheet(appointmentData.id);
  if (caseSheetDetails == null) {
    caseSheetDetails = await caseSheetRepo.getJuniorDoctorCaseSheet(args.appointmentId);
    if (caseSheetDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
    juniorDoctorNotes = caseSheetDetails.notes;
  }

  //get patient info
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointmentData.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

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
> = async (parent, { UpdateCaseSheetInput }, { consultsDb }) => {
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

export const caseSheetResolvers = {
  Mutation: {
    createCaseSheet,
    updateCaseSheet,
  },

  Query: { getJuniorDoctorCaseSheet, getCaseSheet, searchDiagnosis, searchDiagnostic },
};
