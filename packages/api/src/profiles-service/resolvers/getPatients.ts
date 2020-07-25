import gql from 'graphql-tag';
import _ from 'lodash';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, Gender, Relation } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  sendPatientRegistrationNotification,
  sendNotificationWhatsapp,
} from 'notifications-service/resolvers/notifications';
import { ApiConstants } from 'ApiConstants';
import { createPrismUser } from 'helpers/phrV1Services';

export const getPatientTypeDefs = gql`
  type PatientInfo {
    patient: Patient
  }
  type PatientList {
    patients: [Patient]
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
  extend type Query {
    getPatientById(patientId: String): PatientInfo
    getAthsToken(patientId: String): PatientInfo
    getPatientByMobileNumber(mobileNumber: String): PatientList
    getPatients: GetPatientsResult
    getDeviceCodeCount(deviceCode: String): DeviceCountResponse
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

type DeleteProfileResult = {
  status: Boolean;
};

type UpdateWhatsAppStatusResult = {
  status: Boolean;
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
  const patient = await patientRepo.findById(args.patientId);
  if (!patient) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patient };
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
  }
  await patient.save();
  createPrismUser(patient, uhidResp.result.toString());
  //send registration success notification here
  sendPatientRegistrationNotification(patient, profilesDb, '');
  return { patient };
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
  const patient = await patientRepo.findById(patientId);
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
  const patient = await patientRepo.findById(args.patientId);
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
  const patientDetails = await patientRepo.findById(args.patientId);
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
  const patient = await patientRepo.findById(args.patientId);
  if (!patient) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patient };
};

const getPatients = () => {
  return { patients: [] };
};

export const getPatientResolvers = {
  Query: {
    getPatientById,
    getPatientByMobileNumber,
    getPatients,
    getAthsToken,
    getDeviceCodeCount,
  },
  Mutation: {
    deleteProfile,
    addNewProfile,
    editProfile,
    updateWhatsAppStatus,
  },
};
