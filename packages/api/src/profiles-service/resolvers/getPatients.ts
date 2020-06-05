import gql from 'graphql-tag';
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
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
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
> = async (parent, args, { profilesDb }) => {
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
  const savePatient = await patientRepo.saveNewProfile(patientProfileInput);
  patientRepo.createNewUhid(savePatient.id);
  patientRepo.createAthsToken(savePatient.id);
  const patient = await patientRepo.getPatientDetails(savePatient.id);
  if (!patient || patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }

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
    sendNotificationWhatsapp(mobileNumber, '');
    const WHATSAPP_NOTIFICATION_URL = `https://api.in.webengage.com/v1/accounts/in~~c2ab3533/users`;
    const details = {
      userId: mobileNumber,
      whatsappOptIn: true,
    };
    // const APIInput = {
    //   new_name: '',
    //   new_eventtype: 'Insert',
    //   new_jsonentity: JSON.stringify(details),
    // };
    console.log('APIInput=============>', JSON.stringify(details));
    const saveResponse = await fetch(WHATSAPP_NOTIFICATION_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + ApiConstants.WHATSAPP_AUTHORIZATION,
      },
      body: JSON.stringify(details),
    });
    const saveResult = await saveResponse.text();
    console.log('case save result: ', saveResult);

    if (saveResponse.status !== 200 && saveResponse.status !== 201 && saveResponse.status !== 204) {
      console.error(`Invalid response status ${saveResponse.status}.`);
      // throw new Error(`case save Error ${saveCaseResponse.status}`);
    }
  }
  return { status: true };
};

const getAthsToken: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  PatientInfo
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(args.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (patientDetails.athsToken == '' || patientDetails.athsToken == null) {
    await patientRepo.createAthsToken(patientDetails.id);
  }
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
