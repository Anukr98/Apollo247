import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import {
  CaseSheet,
  Appointment,
  CASESHEET_STATUS,
  CaseSheetMedicinePrescription,
  CaseSheetDiagnosis,
  CaseSheetSymptom,
  CaseSheetDiagnosisPrescription,
  CaseSheetOtherInstruction,
  APPOINTMENT_TYPE,
} from 'consults-service/entities';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  Patient,
  PatientFamilyHistory,
  PatientLifeStyle,
  PatientMedicalHistory,
  Gender,
} from 'profiles-service/entities';
import { DiagnosisData } from 'consults-service/data/diagnosis';
import { DiagnosticData } from 'consults-service/data/diagnostics';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import {
  convertCaseSheetToRxPdfData,
  generateRxPdfDocument,
  uploadRxPdf,
} from 'consults-service/rxPdfGenerator';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientFamilyHistoryRepository } from 'profiles-service/repositories/patientFamilyHistoryRepository';
import { PatientLifeStyleRepository } from 'profiles-service/repositories/patientLifeStyleRepository';
import { PatientMedicalHistoryRepository } from 'profiles-service/repositories/patientMedicalHistory';

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
  enum CASESHEET_STATUS {
    PENDING
    COMPLETED
  }

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

  enum MEDICINE_UNIT {
    TABLET
    CAPSULE
    ML
    DROPS
    NA
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

  type Appointment {
    id: String!
    appointmentDateTime: DateTime!
    appointmentDocuments: [AppointmentDocuments]
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

  type AppointmentDocuments {
    documentPath: String
  }

  type CaseSheetFullDetails {
    caseSheetDetails: CaseSheet
    patientDetails: PatientDetails
    pastAppointments: [Appointment]
    juniorDoctorNotes: String
    juniorDoctorCaseSheet: CaseSheet
  }

  type CaseSheet {
    appointment: Appointment
    blobName: String
    createdDate: DateTime
    createdDoctorId: String
    createdDoctorProfile: Profile @provides(fields: "id")
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
    status: String
    sentToPatient: Boolean
  }

  type Diagnosis {
    name: String
  }

  input DiagnosisInput {
    name: String
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

  type DiagnosticPrescription {
    itemname: String
  }

  input DiagnosticPrescriptionInput {
    itemname: String
  }

  type MedicinePrescription {
    medicineConsumptionDurationInDays: String
    medicineDosage: String
    medicineUnit: MEDICINE_UNIT
    medicineInstructions: String
    medicineTimings: [MEDICINE_TIMINGS]
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineName: String
    id: String
  }

  input MedicinePrescriptionInput {
    medicineConsumptionDurationInDays: String
    medicineDosage: String
    medicineUnit: MEDICINE_UNIT
    medicineInstructions: String
    medicineTimings: [MEDICINE_TIMINGS]
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineName: String
    id: String
  }

  type OtherInstructions {
    instruction: String
  }

  input OtherInstructionsInput {
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
    patientAddress: [Address]
    patientMedicalHistory: PatientMedicalHistory
    photoUrl: String
    uhid: String
    relation: Relation
  }

  type PatientLifeStyle {
    description: String
  }

  type PatientMedicalHistory {
    bp: String
    dietAllergies: String
    drugAllergies: String
    height: String
    menstrualHistory: String
    pastMedicalHistory: String
    pastSurgicalHistory: String
    temperature: String
    weight: String
  }

  type PatientHealthVault {
    imageUrls: String
    reportUrls: String
  }

  type PatientFamilyHistory {
    description: String
    relation: String
  }

  input SymptomInput {
    symptom: String
    since: String
    howOften: String
    severity: String
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
    status: CASESHEET_STATUS
  }

  input ModifyCaseSheetInput {
    symptoms: [SymptomInput!]
    notes: String
    diagnosis: [DiagnosisInput!]
    diagnosticPrescription: [DiagnosticPrescriptionInput!]
    followUp: Boolean
    followUpDate: Date
    followUpAfterInDays: Int
    followUpConsultType: APPOINTMENT_TYPE
    otherInstructions: [OtherInstructionsInput!]
    medicinePrescription: [MedicinePrescriptionInput!]
    id: String!
    status: CASESHEET_STATUS
    lifeStyle: String
    familyHistory: String
    dietAllergies: String
    drugAllergies: String
    height: String
    menstrualHistory: String
    pastMedicalHistory: String
    pastSurgicalHistory: String
    temperature: String
    weight: String
    bp: String
  }

  type PatientPrescriptionSentResponse {
    success: Boolean
  }

  extend type Mutation {
    updateCaseSheet(UpdateCaseSheetInput: UpdateCaseSheetInput): CaseSheet
    modifyCaseSheet(ModifyCaseSheetInput: ModifyCaseSheetInput): CaseSheet
    updatePatientPrescriptionSentStatus(
      caseSheetId: ID!
      sentToPatient: Boolean!
    ): PatientPrescriptionSentResponse
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
    juniorDoctorCaseSheet: CaseSheet;
  }
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  //check appointment id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get patient info
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointmentData.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //get loggedin user details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null && mobileNumber != patientDetails.mobileNumber)
    throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  let juniorDoctorNotes = '';

  //check whether there is a senior doctor case-sheet
  const caseSheetDetails = await caseSheetRepo.getSeniorDoctorCaseSheet(appointmentData.id);
  if (caseSheetDetails == null) throw new AphError(AphErrorMessages.NO_CASESHEET_EXIST);

  const juniorDoctorCaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(appointmentData.id);
  if (juniorDoctorCaseSheet == null)
    throw new AphError(AphErrorMessages.JUNIOR_DOCTOR_CASESHEET_NOT_CREATED);
  juniorDoctorNotes = juniorDoctorCaseSheet.notes;

  //get past appointment details
  const pastAppointments = await appointmentRepo.getPastAppointments(
    appointmentData.doctorId,
    appointmentData.patientId
  );

  return {
    caseSheetDetails,
    patientDetails,
    pastAppointments,
    juniorDoctorNotes,
    juniorDoctorCaseSheet,
  };
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
  status: CASESHEET_STATUS;
};

type UpdateCaseSheetInputArgs = { UpdateCaseSheetInput: UpdateCaseSheetInput };

type PatientPrescriptionSentResponse = {
  success: boolean;
};

const updateCaseSheet: Resolver<
  null,
  UpdateCaseSheetInputArgs,
  ConsultServiceContext,
  CaseSheet
> = async (parent, { UpdateCaseSheetInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const inputArguments = JSON.parse(JSON.stringify(UpdateCaseSheetInput));

  //validate date
  if (
    inputArguments.followUpDate.length > 0 &&
    isNaN(new Date(inputArguments.followUpDate).valueOf())
  )
    throw new AphError(AphErrorMessages.INVALID_DATE_FORMAT);

  const followUpAfterInDays =
    inputArguments.followUpAfterInDays == '' ? 0 : <number>inputArguments.followUpAfterInDays;
  const followUpDate = inputArguments.followUpDate == '' ? null : <Date>inputArguments.followUpDate;

  //validate casesheetid
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const getCaseSheetData = await caseSheetRepo.getCaseSheetById(inputArguments.id);
  if (getCaseSheetData == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  getCaseSheetData.symptoms = JSON.parse(inputArguments.symptoms);
  getCaseSheetData.notes = inputArguments.notes;
  getCaseSheetData.diagnosis = JSON.parse(inputArguments.diagnosis);
  getCaseSheetData.diagnosticPrescription = JSON.parse(inputArguments.diagnosticPrescription);
  getCaseSheetData.otherInstructions = JSON.parse(inputArguments.otherInstructions);
  getCaseSheetData.medicinePrescription = JSON.parse(inputArguments.medicinePrescription);
  getCaseSheetData.followUp = inputArguments.followUp;
  if (followUpDate) getCaseSheetData.followUpDate = followUpDate;
  getCaseSheetData.followUpAfterInDays = followUpAfterInDays;
  getCaseSheetData.status = inputArguments.status;

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.findById(getCaseSheetData.patientId);
  if (patientData == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //convert casesheet to prescription
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  const rxPdfData = await convertCaseSheetToRxPdfData(getCaseSheetData, doctorsDb, patientData);
  const pdfDocument = generateRxPdfDocument(rxPdfData);
  const blob = await uploadRxPdf(client, inputArguments.id, pdfDocument);
  if (blob == null) throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  getCaseSheetData.blobName = blob.name;

  const caseSheetAttrs: Omit<Partial<CaseSheet>, 'id'> = getCaseSheetData;

  await caseSheetRepo.updateCaseSheet(inputArguments.id, caseSheetAttrs);
  return getCaseSheetData;
};

type ModifyCaseSheetInput = {
  symptoms: CaseSheetSymptom[];
  notes: string;
  diagnosis: CaseSheetDiagnosis[];
  diagnosticPrescription: CaseSheetDiagnosisPrescription[];
  followUp: boolean;
  followUpDate: Date;
  followUpAfterInDays: number;
  followUpConsultType: APPOINTMENT_TYPE;
  otherInstructions: CaseSheetOtherInstruction[];
  medicinePrescription: CaseSheetMedicinePrescription[];
  id: string;
  status: CASESHEET_STATUS;
  lifeStyle: string;
  familyHistory: string;
  dietAllergies: string;
  drugAllergies: string;
  height: string;
  menstrualHistory: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  temperature: string;
  weight: string;
  bp: string;
};

type ModifyCaseSheetInputArgs = { ModifyCaseSheetInput: ModifyCaseSheetInput };

const modifyCaseSheet: Resolver<
  null,
  ModifyCaseSheetInputArgs,
  ConsultServiceContext,
  CaseSheet
> = async (parent, { ModifyCaseSheetInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const inputArguments = ModifyCaseSheetInput;

  //validate casesheetid
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const getCaseSheetData = await caseSheetRepo.getCaseSheetById(inputArguments.id);
  if (getCaseSheetData == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  if (!(inputArguments.symptoms === undefined)) {
    if (inputArguments.symptoms && inputArguments.symptoms.length === 0)
      throw new AphError(AphErrorMessages.INVALID_SYMPTOMS_LIST);
    getCaseSheetData.symptoms = JSON.parse(JSON.stringify(inputArguments.symptoms));
  }

  if (!(inputArguments.notes === undefined)) {
    getCaseSheetData.notes = inputArguments.notes;
  }

  if (!(inputArguments.diagnosis === undefined)) {
    if (inputArguments.diagnosis && inputArguments.diagnosis.length === 0)
      throw new AphError(AphErrorMessages.INVALID_DIAGNOSIS_LIST);
    getCaseSheetData.diagnosis = JSON.parse(JSON.stringify(inputArguments.diagnosis));
  }

  if (!(inputArguments.diagnosticPrescription === undefined)) {
    if (inputArguments.diagnosticPrescription && inputArguments.diagnosticPrescription.length === 0)
      throw new AphError(AphErrorMessages.INVALID_DIAGNOSTIC_PRESCRIPTION_LIST);
    getCaseSheetData.diagnosticPrescription = JSON.parse(
      JSON.stringify(inputArguments.diagnosticPrescription)
    );
  }

  if (!(inputArguments.otherInstructions === undefined)) {
    if (inputArguments.otherInstructions && inputArguments.otherInstructions.length === 0)
      throw new AphError(AphErrorMessages.INVALID_OTHER_INSTRUCTIONS_LIST);
    getCaseSheetData.otherInstructions = JSON.parse(
      JSON.stringify(inputArguments.otherInstructions)
    );
  }

  if (!(inputArguments.medicinePrescription === undefined)) {
    if (inputArguments.medicinePrescription && inputArguments.medicinePrescription.length === 0)
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_PRESCRIPTION_LIST);
    getCaseSheetData.medicinePrescription = JSON.parse(
      JSON.stringify(inputArguments.medicinePrescription)
    );
  }

  if (!(inputArguments.followUp === undefined)) {
    getCaseSheetData.followUp = inputArguments.followUp;
  }

  if (!(inputArguments.followUpDate === undefined)) {
    if (getCaseSheetData.followUpDate) getCaseSheetData.followUpDate = inputArguments.followUpDate;
  }

  if (!(inputArguments.followUpAfterInDays === undefined)) {
    getCaseSheetData.followUpAfterInDays = inputArguments.followUpAfterInDays;
  }

  if (!(inputArguments.followUpConsultType === undefined)) {
    getCaseSheetData.followUpConsultType = inputArguments.followUpConsultType;
  }

  if (!(inputArguments.status === undefined)) {
    getCaseSheetData.status = inputArguments.status;
  }

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.findById(getCaseSheetData.patientId);
  if (patientData == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //familyHistory upsert starts
  if (!(inputArguments.familyHistory === undefined)) {
    const familyHistoryInputs: Partial<PatientFamilyHistory> = {
      patient: patientData,
      description:
        inputArguments.familyHistory.length > 0 ? inputArguments.familyHistory : undefined,
    };
    const familyHistoryRepo = patientsDb.getCustomRepository(PatientFamilyHistoryRepository);
    const familyHistoryRecord = await familyHistoryRepo.getPatientFamilyHistory(
      getCaseSheetData.patientId
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
  if (!(inputArguments.lifeStyle === undefined)) {
    const lifeStyleInputs: Partial<PatientLifeStyle> = {
      patient: patientData,
      description: inputArguments.lifeStyle.length > 0 ? inputArguments.lifeStyle : undefined,
    };
    const lifeStyleRepo = patientsDb.getCustomRepository(PatientLifeStyleRepository);
    const lifeStyleRecord = await lifeStyleRepo.getPatientLifeStyle(getCaseSheetData.patientId);

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

  if (!(inputArguments.bp === undefined))
    medicalHistoryInputs.bp = inputArguments.bp.length > 0 ? inputArguments.bp : undefined;

  if (!(inputArguments.weight === undefined))
    medicalHistoryInputs.weight =
      inputArguments.weight.length > 0 ? inputArguments.weight : undefined;

  if (!(inputArguments.temperature === undefined))
    medicalHistoryInputs.temperature =
      inputArguments.temperature.length > 0 ? inputArguments.temperature : undefined;

  if (!(inputArguments.pastSurgicalHistory === undefined))
    medicalHistoryInputs.pastSurgicalHistory =
      inputArguments.pastSurgicalHistory.length > 0
        ? inputArguments.pastSurgicalHistory
        : undefined;

  if (!(inputArguments.pastMedicalHistory === undefined))
    medicalHistoryInputs.pastMedicalHistory =
      inputArguments.pastMedicalHistory.length > 0 ? inputArguments.pastMedicalHistory : undefined;

  if (!(inputArguments.menstrualHistory === undefined)) {
    if (patientData.gender === Gender.FEMALE)
      medicalHistoryInputs.menstrualHistory =
        inputArguments.menstrualHistory.length > 0 ? inputArguments.menstrualHistory : undefined;
  }

  if (!(inputArguments.height === undefined)) medicalHistoryInputs.height = inputArguments.height;
  if (!(inputArguments.drugAllergies === undefined))
    medicalHistoryInputs.drugAllergies =
      inputArguments.drugAllergies.length > 0 ? inputArguments.drugAllergies : undefined;

  if (!(inputArguments.dietAllergies === undefined))
    medicalHistoryInputs.dietAllergies =
      inputArguments.dietAllergies.length > 0 ? inputArguments.dietAllergies : undefined;

  const medicalHistoryRepo = patientsDb.getCustomRepository(PatientMedicalHistoryRepository);
  const medicalHistoryRecord = await medicalHistoryRepo.getPatientMedicalHistory(
    getCaseSheetData.patientId
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

  //convert casesheet to prescription
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  const rxPdfData = await convertCaseSheetToRxPdfData(getCaseSheetData, doctorsDb, patientData);
  const pdfDocument = generateRxPdfDocument(rxPdfData);
  const blob = await uploadRxPdf(client, inputArguments.id, pdfDocument);
  if (blob == null) throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  getCaseSheetData.blobName = blob.name;

  const caseSheetAttrs: Omit<Partial<CaseSheet>, 'id'> = getCaseSheetData;

  await caseSheetRepo.updateCaseSheet(inputArguments.id, caseSheetAttrs);
  return getCaseSheetData;
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
      medicinePrescription: juniorDoctorcaseSheet.medicinePrescription,
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

const updatePatientPrescriptionSentStatus: Resolver<
  null,
  { caseSheetId: string; sentToPatient: boolean },
  ConsultServiceContext,
  PatientPrescriptionSentResponse
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb }) => {
  //validate is active Doctor
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //validate casesheetid
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const getCaseSheetData = await caseSheetRepo.getCaseSheetById(args.caseSheetId);
  if (getCaseSheetData == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  const caseSheetAttrs: Partial<CaseSheet> = { sentToPatient: args.sentToPatient };
  await caseSheetRepo.updateCaseSheet(args.caseSheetId, caseSheetAttrs);

  return { success: true };
};

export const caseSheetResolvers = {
  Appointment: {
    doctorInfo(appointments: Appointment) {
      return { __typename: 'Profile', id: appointments.doctorId };
    },
  },
  CaseSheet: {
    createdDoctorProfile(caseSheet: CaseSheet) {
      return { __typename: 'Profile', id: caseSheet.createdDoctorId };
    },
  },

  Mutation: {
    updateCaseSheet,
    modifyCaseSheet,
    updatePatientPrescriptionSentStatus,
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
