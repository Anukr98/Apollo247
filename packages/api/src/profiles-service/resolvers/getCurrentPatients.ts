import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, DEVICE_TYPE } from 'profiles-service/entities';
import fetch from 'node-fetch';
import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
} from 'types/prism';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';
import { getConnection } from 'typeorm';
import { ApiConstants } from 'ApiConstants';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { debugLog } from 'customWinstonLogger';
import { Gender } from 'doctors-service/entities';
import { getRegisteredUsers } from 'helpers/phrV1Services';

export const getCurrentPatientsTypeDefs = gql`
  enum Gender {
    MALE
    FEMALE
    OTHER
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

  type PatientFullDetails @key(fields: "id") {
    allergies: String
    dateOfBirth: Date
    emailAddress: String
    firstName: String
    familyHistory: [FamilyHistory]
    gender: Gender
    healthVault: [HealthVault]
    id: ID!
    lastName: String
    lifeStyle: [LifeStyle]
    mobileNumber: String
    patientAddress: [PatientAddress]
    patientMedicalHistory: MedicalHistory
    photoUrl: String
    uhid: String
    relation: Relation
    isLinked: Boolean
    isUhidPrimary: Boolean
    primaryUhid: String
    primaryPatientId: String
    whatsAppMedicine: Boolean
    whatsAppConsult: Boolean
  }

  type HealthVault {
    imageUrls: String
    reportUrls: String
  }

  type Patient @key(fields: "id") {
    addressList: [PatientAddress!]
    allergies: String
    dateOfBirth: Date
    emailAddress: String
    familyHistory: [FamilyHistory]
    firstName: String
    gender: Gender
    id: ID!
    lastName: String
    lifeStyle: [LifeStyle]
    mobileNumber: String!
    patientMedicalHistory: MedicalHistory
    photoUrl: String
    athsToken: String
    referralCode: String
    relation: Relation
    uhid: String
    isLinked: Boolean
    isUhidPrimary: Boolean
    primaryUhid: String
    primaryPatientId: String
    whatsAppMedicine: Boolean
    whatsAppConsult: Boolean
  }

  type LifeStyle {
    description: String
    occupationHistory: String
  }

  type FamilyHistory {
    description: String
    relation: String
  }

  type MedicalHistory {
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

  type GetCurrentPatientsResult {
    patients: [Patient!]!
  }

  extend type Query {
    getCurrentPatients(appVersion: String, deviceType: DEVICE_TYPE): GetCurrentPatientsResult
    getLoginPatients(appVersion: String, deviceType: DEVICE_TYPE): GetCurrentPatientsResult
  }
`;

export type GetCurrentPatientsResult = {
  patients: Object[] | null;
};

//create first order curried method with first 4 static parameters being passed.
const apiCallId = Math.floor(Math.random() * 10000000);
const dLogger = debugLog('profileServiceLogger', 'getCurrentPatients', apiCallId);

/*const getCurrentPatients: Resolver<
  null,
  { appVersion: string; deviceType: DEVICE_TYPE },
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  let patients;
  patients = await patientRepo.findByMobileNumber(mobileNumber);
  if (patients.length == 0) {
    let isPrismWorking = 1,
      isUserDetails = 0;
    const prismUrl = process.env.PRISM_GET_USERS_URL ? process.env.PRISM_GET_USERS_URL : '';
    const prismHost = process.env.PRISM_HOST ? process.env.PRISM_HOST : '';
    const prismBaseUrl = prismUrl + '/data';
    const prismHeaders = {
      method: 'get',
      headers: { Host: prismHost },
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const apiUrl = `${prismBaseUrl}/getauthtoken?mobile=${mobileNumber}`;

    let uhids;
    let reqStartTime = new Date();
    try {
      const prismAuthToken = await fetch(apiUrl, prismHeaders)
        .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
        .catch((prismGetAuthTokenError: PrismGetAuthTokenError) => {
          dLogger(
            reqStartTime,
            'getCurrentPatients PRISM_GET_AUTHTOKEN_API_CALL___ERROR',
            `${apiUrl} --- ${JSON.stringify(prismGetAuthTokenError)}`
          );
          isPrismWorking = 0;
        });
      dLogger(
        reqStartTime,
        'getCurrentPatients PRISM_GET_AUTHTOKEN_API_CALL___END',
        `${apiUrl} --- ${JSON.stringify(prismAuthToken)}`
      );

      if (prismAuthToken != null) {
        const getUserApiUrl = `${prismBaseUrl}/getusers?authToken=${prismAuthToken.response}&mobile=${mobileNumber}`;

        reqStartTime = new Date();
        uhids = await fetch(getUserApiUrl, prismHeaders)
          .then((res) => res.json() as Promise<PrismGetUsersResponse>)
          .catch((prismGetUsersError: PrismGetUsersError) => {
            dLogger(
              reqStartTime,
              'getCurrentPatients PRISM_GET_USERS_API_CALL___ERROR',
              `${getUserApiUrl} --- ${JSON.stringify(prismGetUsersError)}`
            );
            isPrismWorking = 0;
            isUserDetails = 1;
          });
        dLogger(
          reqStartTime,
          'getCurrentPatients PRISM_GET_USERS_API_CALL___END',
          `${getUserApiUrl} --- ${JSON.stringify(uhids)}`
        );
      } else {
        isUserDetails = 1;
      }
    } catch (e) {
      isPrismWorking = 0;
      isUserDetails = 1;
    }

    reqStartTime = new Date();
    const findOrCreatePatient = (
      findOptions: { uhid?: Patient['uhid']; mobileNumber: Patient['mobileNumber'] },
      createOptions: Partial<Patient>
    ): Promise<Patient> => {
      return Patient.findOne({
        where: { uhid: findOptions.uhid, mobileNumber: findOptions.mobileNumber },
      }).then((existingPatient) => {
        return existingPatient || Patient.create(createOptions).save();
      });
    };

    let patientPromises: Object[] = [];
    //if prism is working - process with prism uhids and 24x7 database
    if (uhids != null && uhids.response != null) {
      isPrismWorking = 1;
      patientPromises = uhids.response!.signUpUserData.map((data) => {
        return findOrCreatePatient(
          { uhid: data.UHID, mobileNumber },
          {
            firstName: data.userName,
            lastName: '',
            gender: data.gender
              ? data.gender.toUpperCase() === Gender.FEMALE
                ? Gender.FEMALE
                : Gender.MALE
              : undefined,
            mobileNumber,
            uhid: data.UHID,
            dateOfBirth: data.dob == 0 ? undefined : new Date(data.dob),
            primaryUhid: data.UHID,
          }
        );
      });
    } else {
      isPrismWorking = 0;
      isUserDetails = 1;
    }

    //if prism is not working - process with 24x7 database
    //isPrismWorking = 0;
    const checkPatients = await patientRepo.findByMobileNumber(mobileNumber);
    if (isPrismWorking == 0 && isUserDetails == 1) {
      if (checkPatients == null || checkPatients.length == 0) {
        patientPromises = [
          findOrCreatePatient(
            { uhid: '', mobileNumber },
            {
              firstName: '',
              lastName: '',
              gender: undefined,
              mobileNumber,
              uhid: '',
              primaryUhid: '',
            }
          ),
        ];
      }
    }
    const updatePatients = await Promise.all(patientPromises).catch((findOrCreateErrors) => {
      throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { findOrCreateErrors });
    });
    dLogger(
      reqStartTime,
      'getCurrentPatients CREATE_OR_RETURN_PATIENTS___END',
      `${updatePatients}`
    );

    reqStartTime = new Date();
    //patients = await patientRepo.findByMobileNumber(mobileNumber);
    patients = await patientRepo.findByMobileNumberLogin(mobileNumber);
    if (args.appVersion && args.deviceType) {
      const versionUpdateRecords = patients.map((patient) => {
        return args.deviceType === DEVICE_TYPE.ANDROID
          ? { id: patient.id, androidVersion: args.appVersion }
          : { id: patient.id, iosVersion: args.appVersion };
      });

      const updatedProfiles = patientRepo.updateProfiles(versionUpdateRecords);
      dLogger(
        reqStartTime,
        'getCurrentPatients ASYNC_UPDATE_APP_VERSION___END',
        `${JSON.stringify(versionUpdateRecords)} --- ${JSON.stringify(updatedProfiles)}`
      );
    }
  }

  return { patients };
}; */

const getLoginPatients: Resolver<
  null,
  { appVersion: string; deviceType: DEVICE_TYPE },
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { mobileNumber, profilesDb }) => {
  let isPrismWorking = 1;
  const prismUrl = process.env.PRISM_GET_USERS_URL ? process.env.PRISM_GET_USERS_URL : '';
  const prismHost = process.env.PRISM_HOST ? process.env.PRISM_HOST : '';
  if (prismUrl == '') {
    //throw new AphError(AphErrorMessages.INVALID_PRISM_URL, undefined, {});
    isPrismWorking = 0;
  }
  const prismBaseUrl = prismUrl + '/data';
  const prismHeaders = {
    method: 'get',
    headers: { Host: prismHost },
    timeOut: ApiConstants.PRISM_TIMEOUT,
  };

  const apiUrl = `${prismBaseUrl}/getauthtoken?mobile=${mobileNumber}`;

  let reqStartTime = new Date();
  const prismAuthToken = await fetch(apiUrl, prismHeaders)
    .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
    .catch((prismGetAuthTokenError: PrismGetAuthTokenError) => {
      dLogger(
        reqStartTime,
        'getLoginPatients PRISM_GET_AUTHTOKEN_API_CALL___ERROR',
        `${apiUrl} --- ${JSON.stringify(prismGetAuthTokenError)}`
      );
      isPrismWorking = 0;
    });
  dLogger(
    reqStartTime,
    'getLoginPatients PRISM_GET_AUTHTOKEN_API_CALL___END',
    `${apiUrl} --- ${JSON.stringify(prismAuthToken)}`
  );

  let uhids;
  if (prismAuthToken != null) {
    const getUserApiUrl = `${prismBaseUrl}/getusers?authToken=${prismAuthToken.response}&mobile=${mobileNumber}`;

    reqStartTime = new Date();
    uhids = await fetch(getUserApiUrl, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetUsersResponse>)
      .catch((prismGetUsersError: PrismGetUsersError) => {
        dLogger(
          reqStartTime,
          'getLoginPatients PRISM_GET_USERS_API_CALL___ERROR',
          `${getUserApiUrl} --- ${JSON.stringify(prismGetUsersError)}`
        );
        isPrismWorking = 0;
      });
    dLogger(
      reqStartTime,
      'getLoginPatients PRISM_GET_USERS_API_CALL___END',
      `${getUserApiUrl} --- ${JSON.stringify(uhids)}`
    );
  }

  reqStartTime = new Date();
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const findOrCreatePatient = (
    findOptions: { uhid?: Patient['uhid']; mobileNumber: Patient['mobileNumber']; isActive: true },
    createOptions: Partial<Patient>
  ): Promise<Patient> => {
    return Patient.findOne({
      where: { uhid: findOptions.uhid, mobileNumber: findOptions.mobileNumber, isActive: true },
    }).then((existingPatient) => {
      return existingPatient || Patient.create(createOptions).save();
    });
  };

  let patientPromises: Object[] = [];
  if (uhids != null && uhids.response != null) {
    isPrismWorking = 1;
    //isPatientInPrism = uhids.response && uhids.response.signUpUserData;
    patientPromises = uhids.response!.signUpUserData.map((data) => {
      return findOrCreatePatient(
        { uhid: data.UHID, mobileNumber, isActive: true },
        {
          firstName: data.userName,
          lastName: '',
          gender: data.gender
            ? data.gender.toUpperCase() === Gender.FEMALE
              ? Gender.FEMALE
              : Gender.MALE
            : undefined,
          mobileNumber,
          uhid: data.UHID,
          dateOfBirth: data.dob == 0 ? undefined : new Date(data.dob),
        }
      );
    });
  } else {
    isPrismWorking = 0;
  }
  const checkPatients = await patientRepo.findByMobileNumber(mobileNumber);
  if (isPrismWorking == 0) {
    if (checkPatients == null || checkPatients.length == 0) {
      patientPromises = [
        findOrCreatePatient(
          { uhid: '', mobileNumber, isActive: true },
          {
            firstName: '',
            lastName: '',
            gender: undefined,
            mobileNumber,
            uhid: '',
          }
        ),
      ];
    }
  }
  const updatePatients = await Promise.all(patientPromises).catch((findOrCreateErrors) => {
    throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { findOrCreateErrors });
  });
  dLogger(reqStartTime, 'getLoginPatients CREATE_OR_RETURN_PATIENTS___END', `${updatePatients}`);

  reqStartTime = new Date();
  const patients = await patientRepo.findByMobileNumberLogin(mobileNumber);
  if (args.appVersion && args.deviceType) {
    const versionUpdateRecords = patients.map((patient) => {
      return args.deviceType === DEVICE_TYPE.ANDROID
        ? { id: patient.id, androidVersion: args.appVersion }
        : { id: patient.id, iosVersion: args.appVersion };
    });
    const updatedProfiles = patientRepo.updateProfiles(versionUpdateRecords);
    dLogger(
      reqStartTime,
      'getLoginPatients ASYNC_UPDATE_APP_VERSION___END',
      `${JSON.stringify(versionUpdateRecords)} --- ${JSON.stringify(updatedProfiles)}`
    );
  }

  return { patients };
};

const getCurrentPatients: Resolver<
  null,
  { appVersion: string; deviceType: DEVICE_TYPE },
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const uhids = await getRegisteredUsers(mobileNumber.replace('+91', ''));

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  let patients = await patientRepo.findByMobileNumberLogin(mobileNumber);
  if (patients.length > 0) return { patients };

  const findOrCreatePatient = async (
    findOptions: { uhid?: Patient['uhid']; mobileNumber: Patient['mobileNumber']; isActive: true },
    createOptions: Partial<Patient>
  ): Promise<Patient> => {
    const existingPatient = await Patient.findOne({
      where: { uhid: findOptions.uhid, mobileNumber: findOptions.mobileNumber, isActive: true },
    });
    return existingPatient || Patient.create(createOptions).save();
  };

  const patientPromises: Object[] = uhids.response.map((data) => {
    return findOrCreatePatient(
      { uhid: data.uhid, mobileNumber, isActive: true },
      {
        firstName: data.userName,
        lastName: '',
        gender: data.gender
          ? data.gender.toUpperCase() === Gender.FEMALE
            ? Gender.FEMALE
            : Gender.MALE
          : undefined,
        mobileNumber,
        uhid: data.uhid,
        dateOfBirth: data.dob.length == 0 ? undefined : new Date(data.dob),
        androidVersion: args.deviceType === DEVICE_TYPE.ANDROID ? args.appVersion : undefined,
        iosVersion: args.deviceType === DEVICE_TYPE.IOS ? args.appVersion : undefined,
        primaryUhid: data.uhid,
      }
    );
  });

  await Promise.all(patientPromises).catch((findOrCreateErrors) => {
    throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { findOrCreateErrors });
  });

  patients = await patientRepo.findByMobileNumberLogin(mobileNumber);

  return { patients };
};

export const getCurrentPatientsResolvers = {
  Patient: {
    async __resolveReference(object: Patient) {
      const connection = getConnection();
      const patientsRepo = connection.getRepository(Patient);
      const patientDetails = await patientsRepo.findOne({
        where: { id: object.id },
        relations: ['lifeStyle', 'familyHistory', 'patientAddress', 'patientMedicalHistory'],
      });
      return patientDetails;
    },
  },

  PatientFullDetails: {
    async __resolveReference(object: Patient) {
      const connection = getConnection();
      const patientsRepo = connection.getRepository(Patient);
      const patientDetails = await patientsRepo.findOne({
        where: { id: object.id },
        relations: [
          'lifeStyle',
          'familyHistory',
          'patientAddress',
          'patientMedicalHistory',
          'healthVault',
        ],
      });
      return patientDetails;
    },
  },

  Query: {
    getCurrentPatients,
    getLoginPatients,
  },
};
