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
  STATUS,
  VALUE_TYPE,
  APPOINTMENT_UPDATED_BY,
  AppointmentUpdateHistory,
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
  UPLOAD_FILE_TYPES,
  PRISM_DOCUMENT_CATEGORY,
} from 'profiles-service/entities';
import { DoctorType } from 'doctors-service/entities';
import { DiagnosisData } from 'consults-service/data/diagnosis';
import { DiagnosticData } from 'consults-service/data/diagnostics';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import {
  convertCaseSheetToRxPdfData,
  generateRxPdfDocument,
  uploadRxPdf,
  uploadPdfBase64ToPrism,
} from 'consults-service/rxPdfGenerator';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientFamilyHistoryRepository } from 'profiles-service/repositories/patientFamilyHistoryRepository';
import { PatientLifeStyleRepository } from 'profiles-service/repositories/patientLifeStyleRepository';
import { PatientMedicalHistoryRepository } from 'profiles-service/repositories/patientMedicalHistory';
import { SecretaryRepository } from 'doctors-service/repositories/secretaryRepository';
import { SymptomsList } from 'types/appointmentTypes';
import { differenceInSeconds } from 'date-fns';
import { ApiConstants, PATIENT_REPO_RELATIONS } from 'ApiConstants';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { NotificationBinRepository } from 'notifications-service/repositories/notificationBinRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';

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

export type Vitals = {
  bp: string;
  temperature: string;
  height: string;
  weight: string;
};

export const caseSheetTypeDefs = gql`
  enum CASESHEET_STATUS {
    COMPLETED
    PENDING
  }

  enum DoctorType {
    APOLLO
    CLINIC
    CRADLE
    DOCTOR_CONNECT
    FERTILITY
    JUNIOR
    PAYROLL
    SPECTRA
    STAR_APOLLO
    SUGAR
    WHITE_DENTAL
    APOLLO_HOMECARE
  }

  enum Gender {
    FEMALE
    MALE
    OTHER
  }

  enum MEDICINE_TIMINGS {
    EVENING
    MORNING
    NIGHT
    NOON
    AS_NEEDED
    NOT_SPECIFIC
  }

  enum MEDICINE_TO_BE_TAKEN {
    AFTER_FOOD
    BEFORE_FOOD
  }

  enum MEDICINE_UNIT {
    AS_PRESCRIBED
    BOTTLE
    CAPSULE
    CREAM
    DROP
    DROPS
    GEL
    GM
    INJECTION
    INTERNATIONAL_UNIT
    LOTION
    ML
    MG
    NA
    OINTMENT
    OTHERS
    PATCH
    POWDER
    PUFF
    ROTACAPS
    SACHET
    SOAP
    SOLUTION
    SPRAY
    SUSPENSION
    SYRUP
    TABLET
    TEASPOON
    UNIT
  }

  enum Relation {
    ME
    BROTHER
    COUSIN
    DAUGHTER
    FATHER
    GRANDDAUGHTER
    GRANDFATHER
    GRANDMOTHER
    GRANDSON
    HUSBAND
    MOTHER
    SISTER
    SON
    WIFE
    OTHER
  }

  enum TEST_COLLECTION_TYPE {
    HC
    CENTER
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
    rescheduleCountByDoctor: Int!
    isFollowUp: Int!
    followUpParentId: String
    isTransfer: Int!
    transferParentId: String
    caseSheet: [CaseSheet!]
    doctorInfo: Profile @provides(fields: "id")
    sdConsultationDate: DateTime
    unreadMessagesCount: Int
  }

  type AppointmentDocuments {
    documentPath: String
    prismFileId: String
  }

  type CaseSheetFullDetails {
    caseSheetDetails: CaseSheet
    patientDetails: PatientDetails
    pastAppointments: [Appointment]
    juniorDoctorNotes: String
    juniorDoctorCaseSheet: CaseSheet
    allowedDosages: [String]
  }

  extend type PatientFullDetails @key(fields: "id") {
    id: ID! @external
  }
  input Vitals {
    height: String
    weight: String
    temperature: String
    bp: String
  }

  type CaseSheet {
    appointment: Appointment
    blobName: String
    consultType: String
    createdDate: DateTime
    createdDoctorId: String
    createdDoctorProfile: Profile @provides(fields: "id")
    diagnosis: [Diagnosis]
    diagnosticPrescription: [DiagnosticPrescription]
    doctorId: String
    doctorType: DoctorType
    followUp: Boolean
    followUpAfterInDays: String
    followUpConsultType: APPOINTMENT_TYPE
    followUpDate: DateTime
    id: String
    isJdConsultStarted: Boolean
    medicinePrescription: [MedicinePrescription]
    removedMedicinePrescription: [MedicinePrescription]
    notes: String
    otherInstructions: [OtherInstructions]
    patientId: String
    patientDetails: PatientFullDetails @provides(fields: "id")
    prescriptionGeneratedDate: DateTime
    sentToPatient: Boolean
    status: String
    symptoms: [SymptomList]
    updatedDate: DateTime
    referralSpecialtyName: String
    referralDescription: String
    version: Int
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
    testInstruction: String
  }

  input DiagnosticPrescriptionInput {
    itemname: String
    testInstruction: String
  }

  enum MEDICINE_FORM_TYPES {
    GEL_LOTION_OINTMENT
    OTHERS
  }
  enum MEDICINE_CONSUMPTION_DURATION {
    DAYS
    MONTHS
    WEEKS
    TILL_NEXT_REVIEW
  }

  enum MEDICINE_FREQUENCY {
    AS_NEEDED
    FIVE_TIMES_A_DAY
    FOUR_TIMES_A_DAY
    ONCE_A_DAY
    THRICE_A_DAY
    TWICE_A_DAY
    ALTERNATE_DAY
    THREE_TIMES_A_WEEK
    ONCE_A_WEEK
    EVERY_HOUR
    EVERY_TWO_HOURS
    EVERY_FOUR_HOURS
    TWICE_A_WEEK
    ONCE_IN_15_DAYS
    ONCE_A_MONTH
    STAT
  }

  enum ROUTE_OF_ADMINISTRATION {
    ORALLY
    SUBLINGUAL
    PER_RECTAL
    LOCAL_APPLICATION
    INTRAMUSCULAR
    INTRAVENOUS
    SUBCUTANEOUS
    INHALE
    GARGLE
    ORAL_DROPS
    NASAL_DROPS
    EYE_DROPS
    EYE_OINTMENT
    EAR_DROPS
    INTRAVAGINAL
    NASALLY
    INTRANASAL_SPRAY
    INTRA_ARTICULAR
    TRIGGER_POINT_INJECTION
  }

  type MedicinePrescription {
    id: String
    externalId: String
    medicineConsumptionDuration: String
    medicineConsumptionDurationInDays: String
    medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION
    medicineDosage: String
    medicineFormTypes: MEDICINE_FORM_TYPES
    medicineFrequency: MEDICINE_FREQUENCY
    medicineInstructions: String
    medicineName: String
    medicineTimings: [MEDICINE_TIMINGS]
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineUnit: MEDICINE_UNIT
    routeOfAdministration: ROUTE_OF_ADMINISTRATION
    medicineCustomDosage: String
  }

  input MedicinePrescriptionInput {
    id: String
    medicineConsumptionDuration: String
    medicineConsumptionDurationInDays: String
    medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION
    medicineDosage: String
    medicineFormTypes: MEDICINE_FORM_TYPES
    medicineFrequency: MEDICINE_FREQUENCY
    medicineInstructions: String
    medicineName: String
    medicineTimings: [MEDICINE_TIMINGS]
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineUnit: MEDICINE_UNIT
    routeOfAdministration: ROUTE_OF_ADMINISTRATION
    medicineCustomDosage: String
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
    occupationHistory: String
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
    medicationHistory: String
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
    details: String
  }

  type SymptomList {
    symptom: String
    since: String
    howOften: String
    severity: String
    details: String
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
    removedMedicinePrescription: [MedicinePrescriptionInput!]
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
    medicationHistory: String
    occupationHistory: String
    referralSpecialtyName: String
    referralDescription: String
  }

  type PatientPrescriptionSentResponse {
    success: Boolean
    blobName: String
    prismFileId: String
    prescriptionGeneratedDate: DateTime
  }

  extend type Mutation {
    modifyCaseSheet(ModifyCaseSheetInput: ModifyCaseSheetInput): CaseSheet
    updatePatientPrescriptionSentStatus(
      caseSheetId: ID!
      sentToPatient: Boolean!
      vitals: Vitals
    ): PatientPrescriptionSentResponse
    createJuniorDoctorCaseSheet(appointmentId: String): CaseSheet
    createSeniorDoctorCaseSheet(appointmentId: String): CaseSheet
    submitJDCaseSheet(appointmentId: String): Boolean
    generatePrescriptionTemp(
      caseSheetId: ID!
      sentToPatient: Boolean!
      mobileNumber: String!
    ): PatientPrescriptionSentResponse
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
    allowedDosages: string[];
  }
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  //check appointment id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //check if logged in mobile number is associated with doctor
  const secretaryRepo = doctorsDb.getCustomRepository(SecretaryRepository);
  const secretaryDetails = await secretaryRepo.getSecretary(mobileNumber, true);

  //get loggedin user details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (
    doctorData == null &&
    secretaryDetails != null &&
    mobileNumber != secretaryDetails.mobileNumber
  )
    throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //get junior doctor case-sheet
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetDetails = await caseSheetRepo.getJuniorDoctorCaseSheet(args.appointmentId);
  if (caseSheetDetails == null) throw new AphError(AphErrorMessages.NO_CASESHEET_EXIST);

  //get patient info
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findByIdWithRelations(appointmentData.patientId, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY,
  ]);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientDetails });

  //get past appointment details
  const pastAppointments = await appointmentRepo.getPastAppointments(
    appointmentData.doctorId,
    primaryPatientIds
  );

  return {
    caseSheetDetails,
    patientDetails,
    pastAppointments,
    allowedDosages: ApiConstants.ALLOWED_DOSAGES.split(','),
  };
};

type AppointmentDocuments = {
  documentPath: string;
  prismFileId: string;
};

type AppointmentDetails = {
  id: string;
  appointmentDateTime: Date;
  appointmentDocuments: AppointmentDocuments[];
  appointmentState: string;
  appointmentType: APPOINTMENT_TYPE;
  displayId: number;
  doctorId: string;
  hospitalId: string;
  patientId: string;
  parentId: string;
  status: STATUS;
  rescheduleCount: number;
  rescheduleCountByDoctor: number;
  isFollowUp: Boolean;
  followUpParentId: string;
  isTransfer: Boolean;
  transferParentId: string;
  caseSheet: CaseSheet[];
  sdConsultationDate: Date;
  unreadMessagesCount: number;
};

const getCaseSheet: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  {
    caseSheetDetails: CaseSheet;
    patientDetails: Patient;
    pastAppointments: AppointmentDetails[];
    juniorDoctorNotes: string;
    juniorDoctorCaseSheet: CaseSheet;
    allowedDosages: string[];
  }
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  //check appointment id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get patient info
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findByIdWithRelations(appointmentData.patientId, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY,
  ]);

  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);
  //check if logged in mobile number is associated with doctor
  const secretaryRepo = doctorsDb.getCustomRepository(SecretaryRepository);
  const secretaryDetails = await secretaryRepo.getSecretary(mobileNumber, true);

  //get loggedin user details
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (
    doctorData == null &&
    mobileNumber != patientDetails.mobileNumber &&
    secretaryDetails != null &&
    mobileNumber != secretaryDetails.mobileNumber
  )
    throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  let juniorDoctorNotes = '';

  //check whether there is a senior doctor case-sheet
  const caseSheetDetails = await caseSheetRepo.getSeniorDoctorLatestCaseSheet(appointmentData.id);
  if (caseSheetDetails == null) throw new AphError(AphErrorMessages.NO_CASESHEET_EXIST);

  const juniorDoctorCaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(appointmentData.id);
  if (juniorDoctorCaseSheet == null)
    throw new AphError(AphErrorMessages.JUNIOR_DOCTOR_CASESHEET_NOT_CREATED);
  juniorDoctorNotes = juniorDoctorCaseSheet.notes;

  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientDetails });

  //get past appointment details
  const pastAppointments = await appointmentRepo.getPastAppointments(
    appointmentData.doctorId,
    primaryPatientIds
  );
  let pastAppointmentsWithUnreadMessages: AppointmentDetails[] = [];
  if (pastAppointments.length) {
    const appointmentIds: string[] = [];
    const appointmentMessagesCount: { [key: string]: number } = {};
    pastAppointments.map((appointment) => {
      appointmentMessagesCount[appointment.id] = 0;
      appointmentIds.push(appointment.id);
    });

    //Getting all the notifications with appointment ids
    const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
    const notifications = await notificationBinRepo.getRequiredFieldsByAppointmentIds(
      appointmentIds,
      ['notificationBin.eventId']
    );

    //Mapping the count of messages with appointment ids
    notifications.map((notification) => {
      if (appointmentMessagesCount[notification.eventId] != undefined) {
        appointmentMessagesCount[notification.eventId]++;
      }
    });

    pastAppointmentsWithUnreadMessages = pastAppointments.map((appointment) => {
      return {
        ...appointment,
        unreadMessagesCount: appointmentMessagesCount[appointment.id],
      };
    });
  }
  return {
    caseSheetDetails,
    patientDetails,
    pastAppointments: pastAppointmentsWithUnreadMessages,
    juniorDoctorNotes,
    juniorDoctorCaseSheet,
    allowedDosages: ApiConstants.ALLOWED_DOSAGES.split(','),
  };
};

type PatientPrescriptionSentResponse = {
  success: boolean;
  blobName: string;
  prismFileId: string;
  prescriptionGeneratedDate: Date | undefined;
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
  removedMedicinePrescription: CaseSheetMedicinePrescription[];
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
  medicationHistory?: string;
  occupationHistory?: string;
  referralSpecialtyName?: string;
  referralDescription?: string;
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

  //stop updating data if PDF is generated already.
  if (getCaseSheetData.blobName && getCaseSheetData.blobName.length > 0)
    throw new AphError(AphErrorMessages.CASESHEET_SENT_TO_PATIENT_ALREADY);

  if (!(inputArguments.symptoms === undefined)) {
    if (inputArguments.symptoms && inputArguments.symptoms.length === 0)
      throw new AphError(AphErrorMessages.INVALID_SYMPTOMS_LIST);
    getCaseSheetData.symptoms = JSON.parse(JSON.stringify(inputArguments.symptoms));
  }

  if (inputArguments.referralSpecialtyName) {
    getCaseSheetData.referralSpecialtyName = inputArguments.referralSpecialtyName;

    if (inputArguments.referralDescription) {
      getCaseSheetData.referralDescription = inputArguments.referralDescription;
    } else {
      throw new AphError(AphErrorMessages.INVALID_REFERRAL_DESCRIPTION);
    }
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

  if (!(inputArguments.removedMedicinePrescription === undefined)) {
    getCaseSheetData.removedMedicinePrescription = JSON.parse(
      JSON.stringify(inputArguments.removedMedicinePrescription)
    );
  }

  if (!(inputArguments.followUp === undefined)) {
    getCaseSheetData.followUp = inputArguments.followUp;
  }

  if (!(inputArguments.followUpDate === undefined)) {
    getCaseSheetData.followUpDate = inputArguments.followUpDate;
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
  const patientData = await patientRepo.findByIdWithRelations(getCaseSheetData.patientId, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY,
  ]);
  if (patientData == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  //familyHistory upsert starts
  if (!(inputArguments.familyHistory === undefined)) {
    const familyHistoryInputs: Partial<PatientFamilyHistory> = {
      patient: patientData,
      description: inputArguments.familyHistory.length > 0 ? inputArguments.familyHistory : '',
    };
    const familyHistoryRepo = patientsDb.getCustomRepository(PatientFamilyHistoryRepository);
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
  if (inputArguments.lifeStyle || inputArguments.occupationHistory) {
    const lifeStyleInputs: Partial<PatientLifeStyle> = {
      patient: patientData,
    };
    if (inputArguments.lifeStyle) {
      lifeStyleInputs.description = inputArguments.lifeStyle;
    }
    if (inputArguments.occupationHistory) {
      lifeStyleInputs.occupationHistory = inputArguments.occupationHistory;
    }
    const lifeStyleRepo = patientsDb.getCustomRepository(PatientLifeStyleRepository);
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
  if (patientData.patientMedicalHistory) {
    medicalHistoryInputs.id = patientData.patientMedicalHistory.id;
  }

  if (inputArguments.medicationHistory) {
    medicalHistoryInputs.medicationHistory = inputArguments.medicationHistory;
  }

  if (!(inputArguments.bp === undefined))
    medicalHistoryInputs.bp = inputArguments.bp.length > 0 ? inputArguments.bp : '';

  if (!(inputArguments.weight === undefined))
    medicalHistoryInputs.weight = inputArguments.weight.length > 0 ? inputArguments.weight : '';

  if (!(inputArguments.temperature === undefined))
    medicalHistoryInputs.temperature =
      inputArguments.temperature.length > 0 ? inputArguments.temperature : '';

  if (!(inputArguments.pastSurgicalHistory === undefined))
    medicalHistoryInputs.pastSurgicalHistory =
      inputArguments.pastSurgicalHistory.length > 0 ? inputArguments.pastSurgicalHistory : '';

  if (!(inputArguments.pastMedicalHistory === undefined))
    medicalHistoryInputs.pastMedicalHistory =
      inputArguments.pastMedicalHistory.length > 0 ? inputArguments.pastMedicalHistory : '';

  if (!(inputArguments.menstrualHistory === undefined)) {
    if (patientData.gender === Gender.FEMALE)
      medicalHistoryInputs.menstrualHistory =
        inputArguments.menstrualHistory.length > 0 ? inputArguments.menstrualHistory : '';
  }

  if (!(inputArguments.height === undefined)) medicalHistoryInputs.height = inputArguments.height;
  if (!(inputArguments.drugAllergies === undefined))
    medicalHistoryInputs.drugAllergies =
      inputArguments.drugAllergies.length > 0 ? inputArguments.drugAllergies : '';

  if (!(inputArguments.dietAllergies === undefined))
    medicalHistoryInputs.dietAllergies =
      inputArguments.dietAllergies.length > 0 ? inputArguments.dietAllergies : '';

  const medicalHistoryRepo = patientsDb.getCustomRepository(PatientMedicalHistoryRepository);
  const medicalHistoryRecord = await medicalHistoryRepo.getPatientMedicalHistory(
    getCaseSheetData.patientId
  );
  if (medicalHistoryRecord == null) {
    //create
    medicalHistoryRepo.savePatientMedicalHistory(medicalHistoryInputs);
  } else {
    //update
    medicalHistoryRepo.updatePatientMedicalHistory(medicalHistoryRecord.id, medicalHistoryInputs);
  }

  getCaseSheetData.updatedDate = new Date();
  getCaseSheetData.preperationTimeInSeconds = differenceInSeconds(
    getCaseSheetData.updatedDate,
    getCaseSheetData.createdDate
  );
  delete getCaseSheetData.status;
  //medicalHistory upsert ends
  const caseSheetAttrs: Omit<Partial<CaseSheet>, 'id'> = getCaseSheetData;
  await caseSheetRepo.updateCaseSheet(inputArguments.id, caseSheetAttrs);
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(getCaseSheetData.appointment.id);
  if (appointmentData) {
    let reason = ApiConstants.CASESHEET_COMPLETED_HISTORY.toString();
    if (caseSheetAttrs.doctorType == DoctorType.JUNIOR) {
      reason = ApiConstants.JD_CASESHEET_COMPLETED_HISTORY.toString();
    }
    const historyAttrs: Partial<AppointmentUpdateHistory> = {
      appointment: appointmentData,
      userType: APPOINTMENT_UPDATED_BY.DOCTOR,
      fromValue: appointmentData.status,
      toValue: appointmentData.status,
      valueType: VALUE_TYPE.STATUS,
      fromState: appointmentData.appointmentState,
      toState: appointmentData.appointmentState,
      userName: caseSheetAttrs.createdDoctorId,
      reason,
    };
    appointmentRepo.saveAppointmentHistory(historyAttrs);
  }
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
  if (doctorData.doctorType != DoctorType.JUNIOR) throw new AphError(AphErrorMessages.UNAUTHORIZED);

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

  if (appointmentData.symptoms && appointmentData.symptoms.length > 0) {
    const symptoms = appointmentData.symptoms.split(',');
    const symptomList: SymptomsList[] = [];
    symptoms.map((symptom: string) => {
      const eachsymptom = {
        symptom: symptom,
        since: null,
        howOften: null,
        severity: null,
        details: null,
      };
      symptomList.push(eachsymptom);
    });

    caseSheetAttrs.symptoms = JSON.parse(JSON.stringify(symptomList));
  }

  caseSheetDetails = await caseSheetRepo.savecaseSheet(caseSheetAttrs);
  const historyAttrs: Partial<AppointmentUpdateHistory> = {
    appointment: appointmentData,
    userType: APPOINTMENT_UPDATED_BY.DOCTOR,
    fromValue: appointmentData.status,
    toValue: appointmentData.status,
    valueType: VALUE_TYPE.STATUS,
    fromState: appointmentData.appointmentState,
    toState: appointmentData.appointmentState,
    userName: doctorData.id,
    reason: 'JD ' + ApiConstants.CASESHEET_CREATED_HISTORY.toString() + ', ' + doctorData.id,
  };
  appointmentRepo.saveAppointmentHistory(historyAttrs);
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
  if (doctorData.doctorType == DoctorType.JUNIOR) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //get appointment details
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const juniorDoctorcaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(args.appointmentId);
  if (juniorDoctorcaseSheet == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  //check whether if senior doctors casesheet already exists
  const sdCaseSheets = await caseSheetRepo.getSeniorDoctorMultipleCaseSheet(args.appointmentId);

  if (sdCaseSheets == null || sdCaseSheets.length == 0) {
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
    const historyAttrs: Partial<AppointmentUpdateHistory> = {
      appointment: appointmentData,
      userType: APPOINTMENT_UPDATED_BY.DOCTOR,
      fromValue: appointmentData.status,
      toValue: appointmentData.status,
      valueType: VALUE_TYPE.STATUS,
      fromState: appointmentData.appointmentState,
      toState: appointmentData.appointmentState,
      userName: appointmentData.doctorId,
      reason:
        'SD ' + ApiConstants.CASESHEET_CREATED_HISTORY.toString() + ', ' + appointmentData.doctorId,
    };
    appointmentRepo.saveAppointmentHistory(historyAttrs);
    return await caseSheetRepo.savecaseSheet(caseSheetAttrs);
  }

  if (sdCaseSheets.length > 0) {
    //check whether latest version is not in complete status
    if (sdCaseSheets[0].status != CASESHEET_STATUS.COMPLETED) {
      return sdCaseSheets[0];
    }
    const caseSheetAttrs: Partial<CaseSheet> = {
      diagnosis: sdCaseSheets[0].diagnosis,
      diagnosticPrescription: sdCaseSheets[0].diagnosticPrescription,
      followUp: sdCaseSheets[0].followUp,
      followUpAfterInDays: sdCaseSheets[0].followUpAfterInDays,
      followUpDate: sdCaseSheets[0].followUpDate,
      otherInstructions: sdCaseSheets[0].otherInstructions,
      symptoms: sdCaseSheets[0].symptoms,
      medicinePrescription: sdCaseSheets[0].medicinePrescription,
      consultType: appointmentData.appointmentType,
      doctorId: sdCaseSheets[0].doctorId,
      patientId: sdCaseSheets[0].patientId,
      appointment: appointmentData,
      createdDoctorId: appointmentData.doctorId,
      doctorType: doctorData.doctorType,
      version: sdCaseSheets[0].version + 1,
      referralSpecialtyName: sdCaseSheets[0].referralSpecialtyName,
      referralDescription: sdCaseSheets[0].referralDescription,
      isJdConsultStarted: sdCaseSheets[0].isJdConsultStarted,
      notes: sdCaseSheets[0].notes,
    };
    const historyAttrs: Partial<AppointmentUpdateHistory> = {
      appointment: appointmentData,
      userType: APPOINTMENT_UPDATED_BY.DOCTOR,
      fromValue: appointmentData.status,
      toValue: appointmentData.status,
      valueType: VALUE_TYPE.STATUS,
      fromState: appointmentData.appointmentState,
      toState: appointmentData.appointmentState,
      userName: appointmentData.doctorId,
      reason: 'SD ' + ApiConstants.CASESHEET_CREATED_HISTORY.toString() + ', ' + doctorData.id,
    };
    appointmentRepo.saveAppointmentHistory(historyAttrs);
    return await caseSheetRepo.savecaseSheet(caseSheetAttrs);
  }

  return sdCaseSheets[0];
};

const submitJDCaseSheet: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  Boolean
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.searchDoctorByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  if (doctorData.doctorType == DoctorType.JUNIOR) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //checking appointment details
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const juniorDoctorcaseSheet = await caseSheetRepo.getJDCaseSheetByAppointmentId(
    args.appointmentId
  );

  if (juniorDoctorcaseSheet && juniorDoctorcaseSheet.isJdConsultStarted) {
    return false;
  }

  const virtualJDId = process.env.VIRTUAL_JD_ID;
  const createdDate = new Date();

  const ConsultQueueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
  //queue record will be present if isJdQuestionsComplete is true in appointment
  if (!appointmentData.isJdQuestionsComplete) {
    const consultQueueAttrs = {
      appointmentId: appointmentData.id,
      createdDate: createdDate,
      doctorId: virtualJDId,
      isActive: false,
    };
    ConsultQueueRepo.saveConsultQueueItems([consultQueueAttrs]);
    appointmentRepo.updateJdQuestionStatusbyIds([appointmentData.id]);
  } else {
    const queueItem = await ConsultQueueRepo.findByAppointmentId(appointmentData.id);
    if (queueItem) ConsultQueueRepo.updateConsultQueueItems([queueItem.id.toString()], virtualJDId);
  }

  //updating or inserting the case sheet
  if (juniorDoctorcaseSheet) {
    const casesheetAttrsToUpdate = {
      createdDoctorId: virtualJDId,
      status: CASESHEET_STATUS.COMPLETED,
      notes: ApiConstants.AUTO_SUBMIT_BY_SD.toString(),
      isJdConsultStarted: true,
    };
    await caseSheetRepo.updateCaseSheet(juniorDoctorcaseSheet.id, casesheetAttrsToUpdate);
  } else {
    const casesheetAttrsToAdd = {
      createdDate: createdDate,
      consultType: appointmentData.appointmentType,
      createdDoctorId: virtualJDId,
      doctorType: DoctorType.JUNIOR,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      appointment: appointmentData,
      status: CASESHEET_STATUS.COMPLETED,
      notes: ApiConstants.AUTO_SUBMIT_BY_SD.toString(),
      isJdConsultStarted: true,
    };
    await caseSheetRepo.savecaseSheet(casesheetAttrsToAdd);
  }
  const historyAttrs: Partial<AppointmentUpdateHistory> = {
    appointment: appointmentData,
    userType: APPOINTMENT_UPDATED_BY.DOCTOR,
    fromValue: appointmentData.status,
    toValue: appointmentData.status,
    valueType: VALUE_TYPE.STATUS,
    fromState: appointmentData.appointmentState,
    toState: appointmentData.appointmentState,
    userName: virtualJDId,
    reason: 'Virtaul JD ' + ApiConstants.CASESHEET_COMPLETED_HISTORY.toString(),
  };
  appointmentRepo.saveAppointmentHistory(historyAttrs);
  return true;
};

const updatePatientPrescriptionSentStatus: Resolver<
  null,
  { caseSheetId: string; sentToPatient: boolean; vitals: Vitals },
  ConsultServiceContext,
  PatientPrescriptionSentResponse
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  //validate is active Doctor
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //validate casesheetid
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const getCaseSheetData = await caseSheetRepo.getCaseSheetById(args.caseSheetId);
  if (getCaseSheetData == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.getPatientDetails(getCaseSheetData.patientId);
  if (patientData == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  let caseSheetAttrs: Partial<CaseSheet> = {
    sentToPatient: args.sentToPatient,
    blobName: '',
    prismFileId: '',
    prescriptionGeneratedDate: new Date(),
  };

  if (args.sentToPatient) {
    //convert casesheet to prescription
    const client = new AphStorageClient(
      process.env.AZURE_STORAGE_CONNECTION_STRING_API,
      process.env.AZURE_STORAGE_CONTAINER_NAME
    );

    const rxPdfData = await convertCaseSheetToRxPdfData(getCaseSheetData, doctorsDb, patientData);
    const pdfDocument = generateRxPdfDocument(rxPdfData);
    const uploadedPdfData = await uploadRxPdf(client, args.caseSheetId, pdfDocument);
    if (uploadedPdfData == null) throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);

    const uploadPdfInput = {
      fileType: UPLOAD_FILE_TYPES.PDF,
      base64FileInput: uploadedPdfData.base64pdf,
      patientId: patientData.id,
      category: PRISM_DOCUMENT_CATEGORY.OpSummary,
      status: CASESHEET_STATUS.COMPLETED,
    };

    const prismUploadResponse = await uploadPdfBase64ToPrism(
      uploadPdfInput,
      patientData,
      patientsDb,
      doctorData,
      getCaseSheetData
    );
    const pushNotificationInput = {
      appointmentId: getCaseSheetData.appointment.id,
      notificationType: NotificationType.PRESCRIPTION_READY,
      blobName: uploadedPdfData.name,
    };
    sendNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
    caseSheetAttrs = {
      sentToPatient: args.sentToPatient,
      blobName: uploadedPdfData.name,
      prismFileId: prismUploadResponse.fileId,
      status: CASESHEET_STATUS.COMPLETED,
      prescriptionGeneratedDate: new Date(),
    };
  }
  if (args.vitals) {
    //medicalHistory upsert starts
    const medicalHistoryInputs: Partial<PatientMedicalHistory> = {
      patient: patientData,
    };

    if (!(args.vitals.bp === undefined))
      medicalHistoryInputs.bp = args.vitals.bp.length > 0 ? args.vitals.bp : undefined;

    if (!(args.vitals.weight === undefined))
      medicalHistoryInputs.weight = args.vitals.weight.length > 0 ? args.vitals.weight : undefined;

    if (!(args.vitals.temperature === undefined))
      medicalHistoryInputs.temperature =
        args.vitals.temperature.length > 0 ? args.vitals.temperature : undefined;

    if (!(args.vitals.height === undefined)) medicalHistoryInputs.height = args.vitals.height;
    const medicalHistoryRepo = await patientsDb.getCustomRepository(
      PatientMedicalHistoryRepository
    );
    const medicalHistoryRecord = await medicalHistoryRepo.getPatientMedicalHistory(patientData.id);
    if (medicalHistoryRecord == null) {
      //create
      medicalHistoryRepo.savePatientMedicalHistory(medicalHistoryInputs);
    } else {
      //update
      medicalHistoryRepo.updatePatientMedicalHistory(medicalHistoryRecord.id, medicalHistoryInputs);
    }
  }

  await caseSheetRepo.updateCaseSheet(args.caseSheetId, caseSheetAttrs);
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await apptRepo.findById(getCaseSheetData.appointment.id);
  if (appointment) {
    const historyAttrs: Partial<AppointmentUpdateHistory> = {
      appointment,
      userType: APPOINTMENT_UPDATED_BY.PATIENT,
      fromValue: appointment.status,
      toValue: appointment.status,
      valueType: VALUE_TYPE.STATUS,
      fromState: appointment.appointmentState,
      toState: appointment.appointmentState,
      userName: appointment.patientId,
      reason: ApiConstants.CASESHEET_COMPLETED_HISTORY.toString(),
    };
    apptRepo.saveAppointmentHistory(historyAttrs);
  }
  return {
    success: true,
    blobName: caseSheetAttrs.blobName || '',
    prismFileId: caseSheetAttrs.prismFileId || '',
    prescriptionGeneratedDate: caseSheetAttrs.prescriptionGeneratedDate,
  };
};

//api for temporary use
const generatePrescriptionTemp: Resolver<
  null,
  { caseSheetId: string; sentToPatient: boolean; mobileNumber: string },
  ConsultServiceContext,
  PatientPrescriptionSentResponse
> = async (parent, args, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  //validate is active Doctor
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(args.mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //validate casesheetid
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const getCaseSheetData = await caseSheetRepo.getCaseSheetById(args.caseSheetId);
  if (getCaseSheetData == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.getPatientData(getCaseSheetData.patientId);
  if (patientData == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  let caseSheetAttrs: Partial<CaseSheet> = {
    sentToPatient: args.sentToPatient,
    blobName: '',
    prismFileId: '',
    prescriptionGeneratedDate: new Date(),
  };

  if (args.sentToPatient) {
    //convert casesheet to prescription
    const client = new AphStorageClient(
      process.env.AZURE_STORAGE_CONNECTION_STRING_API,
      process.env.AZURE_STORAGE_CONTAINER_NAME
    );

    const rxPdfData = await convertCaseSheetToRxPdfData(getCaseSheetData, doctorsDb, patientData);
    const pdfDocument = generateRxPdfDocument(rxPdfData);
    const uploadedPdfData = await uploadRxPdf(client, args.caseSheetId, pdfDocument);
    if (uploadedPdfData == null) throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);

    const uploadPdfInput = {
      fileType: UPLOAD_FILE_TYPES.PDF,
      base64FileInput: uploadedPdfData.base64pdf,
      patientId: patientData.id,
      category: PRISM_DOCUMENT_CATEGORY.OpSummary,
      status: CASESHEET_STATUS.COMPLETED,
    };

    const prismUploadResponse = await uploadPdfBase64ToPrism(
      uploadPdfInput,
      patientData,
      patientsDb,
      doctorData,
      getCaseSheetData
    );
    const pushNotificationInput = {
      appointmentId: getCaseSheetData.appointment.id,
      notificationType: NotificationType.PRESCRIPTION_READY,
      blobName: uploadedPdfData.name,
    };
    sendNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
    caseSheetAttrs = {
      sentToPatient: args.sentToPatient,
      blobName: uploadedPdfData.name,
      prismFileId: prismUploadResponse.fileId,
      status: CASESHEET_STATUS.COMPLETED,
      prescriptionGeneratedDate: new Date(),
    };
  }

  await caseSheetRepo.updateCaseSheet(args.caseSheetId, caseSheetAttrs);
  return {
    success: true,
    blobName: caseSheetAttrs.blobName || '',
    prismFileId: caseSheetAttrs.prismFileId || '',
    prescriptionGeneratedDate: caseSheetAttrs.prescriptionGeneratedDate,
  };
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
    patientDetails(caseSheet: CaseSheet) {
      return { __typename: 'PatientFullDetails', id: caseSheet.patientId };
    },
  },

  Mutation: {
    modifyCaseSheet,
    updatePatientPrescriptionSentStatus,
    createJuniorDoctorCaseSheet,
    createSeniorDoctorCaseSheet,
    submitJDCaseSheet,
    generatePrescriptionTemp,
  },

  Query: {
    getCaseSheet,
    getJuniorDoctorCaseSheet,
    searchDiagnosis,
    searchDiagnostic,
  },
};
