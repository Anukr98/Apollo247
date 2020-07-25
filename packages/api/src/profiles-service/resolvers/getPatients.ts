import gql from 'graphql-tag';
//import _ from 'lodash';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, Gender, Relation } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
//import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  sendPatientRegistrationNotification,
  sendNotificationWhatsapp,
} from 'notifications-service/resolvers/notifications';
import { ApiConstants, PATIENT_REPO_RELATIONS } from 'ApiConstants';

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
`

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

  const patient = await patientRepo.findByIdWithRelations(args.patientId, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY
  ]);

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
  /*const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  let appointmentList = [];

  for (let i = 0; i < patients.length; i++) {
    const appointmentCount = await appointmentRepo.getPatientAppointmentCountByPatientIds(
      patients[i].id
    );
    const patientObj = {
      appointmentCount: appointmentCount,
      patientId: patients[i].id,
    };
    appointmentList.push(patientObj);
  }

  appointmentList = _.sortBy(appointmentList, 'appointmentCount').reverse();
  const patientResult = [];

  for (let i = 0; i < appointmentList.length; i++) {
    const id = appointmentList[i].patientId;
    const objResult = patients.find((x) => x.id == id);
    if (!objResult) {
      continue;
    }
    patientResult.push(objResult);
  }
  return { patients: patientResult };*/
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
  await patientRepo.createNewUhid(savePatient.id);
  patientRepo.createAthsToken(savePatient.id);

  const patient = await patientRepo.findByIdWithRelations(savePatient.id, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY
  ]);

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
  const patient = await patientRepo.getPatientDetails(patientId);

  if (patient == null) throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, {});
  return { patient }
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
    console.log('APIInput=============>', JSON.stringify(details));
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

    if (saveResponse.status !== 200 && saveResponse.status !== 201 && saveResponse.status !== 204) {
      console.error(`Invalid response status ${saveResponse.status}.`);
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
  const patient = await patientRepo.findByIdWithRelations(args.patientId, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY
  ]);
  if (!patient) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  if (patient.athsToken == '' || patient.athsToken == null) {
    await patientRepo.createAthsToken(patient.id);
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
