import gql from 'graphql-tag';
//import _ from 'lodash';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, Gender, Relation } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  sendPatientRegistrationNotification,
  sendNotificationWhatsapp,
} from 'notifications-service/handlers';
import { ApiConstants, PATIENT_REPO_RELATIONS } from 'ApiConstants';
import { createPrismUser } from 'helpers/phrV1Services';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import _ from 'lodash';

export const getPatientTypeDefs = gql`
  type PatientInfo {
    patient: Patient
  }
  type PatientList {
    patients: [Patient]
  }
  type LinkedPatientIds {
    primaryPatientIds: [String]
  }
  type DeviceCountResponse {
    deviceCount: Int
  }
  type GetPatientsResult {
    patients: [Patient!]!
  }

  type DeleteProfileResult {
    status: Boolean!
  }
  input PatientProfileInput {
    firstName: String!
    lastName: String!
    dateOfBirth: Date!
    gender: Gender!
    relation: Relation!
    emailAddress: String!
    photoUrl: String!
    mobileNumber: String!
  }
  input EditProfileInput {
    firstName: String!
    lastName: String!
    dateOfBirth: Date!
    gender: Gender!
    relation: Relation!
    emailAddress: String!
    photoUrl: String!
    id: ID!
  }
  type UpdateWhatsAppStatusResult {
    status: Boolean
  }

  type LinkedPatientIDs {
    ids: [String]
  }

  type appointmentCountResult {
    patientid: String
    count: Int
  }

  extend type Query {
    getPatientById(patientId: String): PatientInfo
    getPatient(patientId: String): PatientInfo
    getLinkedPatientIDs(patientId: String): LinkedPatientIDs
    getAthsToken(patientId: String): PatientInfo
    getPatientByMobileNumber(mobileNumber: String): PatientList
    getPatients: GetPatientsResult
    getDeviceCodeCount(deviceCode: String): DeviceCountResponse
    getLinkedPatientIds(patientId: String): LinkedPatientIds
    getProfileConsultCount: [appointmentCountResult]
  }
  extend type Mutation {
    deleteProfile(patientId: String): DeleteProfileResult!
    addNewProfile(patientProfileInput: PatientProfileInput): PatientInfo!
    editProfile(editProfileInput: EditProfileInput): PatientInfo!
    updateWhatsAppStatus(
      whatsAppMedicine: Boolean
      whatsAppConsult: Boolean
      patientId: String
    ): UpdateWhatsAppStatusResult!
    createNewUHID(patientID: String!): String
  }
`;

type PatientProfileInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  relation: Relation;
  emailAddress: string;
  photoUrl: string;
  mobileNumber: string;
};

type EditProfileInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  relation: Relation;
  emailAddress: string;
  photoUrl: string;
  id: string;
};

type PatientInfo = {
  patient: Patient;
};
type PatientList = {
  patients: Patient[];
};
type LinkedPatientIds = {
  primaryPatientIds: string[];
};

type DeleteProfileResult = {
  status: Boolean;
};

type UpdateWhatsAppStatusResult = {
  status: Boolean;
};

type LinkedPatientIDs = {
  ids: String[];
};

type PatientDetails = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: Gender;
};

type PatientProfileInputArgs = { patientProfileInput: PatientProfileInput };
type EditProfileInputArgs = { editProfileInput: EditProfileInput };

const getPatientById: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  PatientInfo
> = async (parent, args, { profilesDb, mobileNumber }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.checkMobileIdInfo(mobileNumber, '', args.patientId);
  if (!patientData) throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS);

  const patient = await patientRepo.findByIdWithRelations(args.patientId, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY,
  ]);

  if (!patient) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patient };
};

const getPatient: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  PatientInfo
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);

  const patient = await patientRepo.getPatientDetails(args.patientId);
  if (!patient) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patient };
};

const getLinkedPatientIDs: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  LinkedPatientIDs
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);

  const patients = await patientRepo.getLinkedPatientIds({ patientId: args.patientId });
  return {
    ids: patients,
  };
};

const getPatientByMobileNumber: Resolver<
  null,
  { mobileNumber: string },
  ProfilesServiceContext,
  PatientList
> = async (parent, args, { mobileNumber, profilesDb, consultsDb }) => {
  if (mobileNumber != args.mobileNumber) {
    throw new AphError(AphErrorMessages.INVALID_MOBILE_NUMBER, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patients = await patientRepo.findByMobileNumber(args.mobileNumber);

  if (!patients) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }
  return { patients };
};

const addNewProfile: Resolver<
  null,
  PatientProfileInputArgs,
  ProfilesServiceContext,
  PatientInfo
> = async (parent, { patientProfileInput }, { mobileNumber, profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const pateintDetails = await patientRepo.findByMobileNumber(patientProfileInput.mobileNumber);

  if (pateintDetails == null || pateintDetails.length == 0)
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  const patient = await patientRepo.create(patientProfileInput);

  const uhidResp = await patientRepo.getNewUhid(patient);
  if (uhidResp.retcode == '0') {
    patient.uhid = uhidResp.result;
    patient.primaryUhid = uhidResp.result;
    patient.uhidCreatedDate = new Date();
    createPrismUser(patient, uhidResp.result.toString());
  }
  await patient.save();

  //send registration success notification here
  sendPatientRegistrationNotification(patient, profilesDb, '');
  return { patient };
};

type appointmentCountResult = {
  patientid: string;
  count: number;
};

const getProfileConsultCount: Resolver<
  null,
  {},
  ProfilesServiceContext,
  appointmentCountResult[]
> = async (parent, args, { profilesDb, consultsDb, mobileNumber }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findByMobileNumber(mobileNumber);
  if (patientDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const patientIds = patientDetails.map((data) => {
    return data.id;
  });

  const appointmentDetails = await appointmentRepo.getAppointmentCountByPatientId(patientIds);
  return appointmentDetails;
};

const editProfile: Resolver<
  null,
  EditProfileInputArgs,
  ProfilesServiceContext,
  PatientInfo
> = async (parent, { editProfileInput }, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientId = editProfileInput.id;
  delete editProfileInput.id;

  await patientRepo.updateProfile(patientId, editProfileInput);
  const patient = await patientRepo.getPatientDetails(patientId);

  if (patient == null) throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, {});
  return { patient };
};

const deleteProfile: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  DeleteProfileResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientRepo.getPatientDetails(args.patientId);
  if (patient == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

  await patientRepo.deleteProfile(args.patientId);
  return { status: true };
};

type DeviceCountResponse = {
  deviceCount: number;
};
const getDeviceCodeCount: Resolver<
  null,
  { deviceCode: string },
  ProfilesServiceContext,
  DeviceCountResponse
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);

  const deviceCount = await patientRepo.getDeviceCodeCount(args.deviceCode);
  return { deviceCount };
};

const updateWhatsAppStatus: Resolver<
  null,
  { whatsAppMedicine: boolean; whatsAppConsult: boolean; patientId: string },
  ProfilesServiceContext,
  UpdateWhatsAppStatusResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  await patientRepo.updateWhatsAppStatus(
    args.patientId,
    args.whatsAppConsult,
    args.whatsAppMedicine
  );
  const patientDetails = await patientRepo.getPatientDetails(args.patientId);

  const mobileNumber = patientDetails ? patientDetails.mobileNumber : '';
  if (args.whatsAppConsult === true || args.whatsAppMedicine === true) {
    sendNotificationWhatsapp(mobileNumber, '', 0);
    const details = {
      userId: mobileNumber,
      whatsappOptIn: true,
    };

    const saveResponse = await fetch(process.env.WEB_ENGAGE_URL ? process.env.WEB_ENGAGE_URL : '', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + ApiConstants.WEB_ENGAGE_AUTHORIZATION,
      },
      body: JSON.stringify(details),
    });
    await saveResponse.text();
  }
  return { status: true };
};

//TODO : Remove this
const getAthsToken: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  PatientInfo
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientRepo.getPatientDetails(args.patientId);

  if (!patient) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  return { patient };
};

const createNewUHID: Resolver<null, { patientID: string }, ProfilesServiceContext, string> = async (
  parent,
  args,
  { profilesDb }
) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientRepo.getPatientDetails(args.patientID);
  if (!patient) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return await patientRepo.createNewUhid(patient);
};

const getPatients = () => {
  return { patients: [] };
};

const getLinkedPatientIds: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  LinkedPatientIds
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientId = args.patientId;
  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientId });
  if (!primaryPatientIds) throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS);

  return { primaryPatientIds };
};

export const getPatientResolvers = {
  Query: {
    getPatientById,
    getPatient,
    getLinkedPatientIDs,
    getPatientByMobileNumber,
    getPatients,
    getAthsToken,
    getDeviceCodeCount,
    getLinkedPatientIds,
    getProfileConsultCount,
  },
  Mutation: {
    deleteProfile,
    addNewProfile,
    editProfile,
    updateWhatsAppStatus,
    createNewUHID,
  },
};
