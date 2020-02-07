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
import { log, debugLog } from 'customWinstonLogger';

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
  }

  type LifeStyle {
    description: String
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
  }

  type GetCurrentPatientsResult {
    patients: [Patient!]!
  }

  extend type Query {
    getCurrentPatients(appVersion: String, deviceType: DEVICE_TYPE): GetCurrentPatientsResult
    getLoginPatients(appVersion: String, deviceType: DEVICE_TYPE): GetCurrentPatientsResult
  }
`;

type GetCurrentPatientsResult = {
  patients: Object[] | null;
};

const getCurrentPatients: Resolver<
  null,
  { appVersion: string; deviceType: DEVICE_TYPE },
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  let patients;
  patients = await patientRepo.findByMobileNumber(mobileNumber);
  if (patients.length == 0) {
    const callStartTime = new Date();
    const apiCallId = Math.floor(Math.random() * 1000000);
    //create first order curried method with first 4 static parameters being passed.
    const homeLogger = debugLog(
      'currentPatientsAPILogger',
      'login',
      apiCallId,
      callStartTime,
      mobileNumber
    );

    homeLogger('API_CALL___START');

    let isPrismWorking = 1;
    const prismUrl = process.env.PRISM_GET_USERS_URL ? process.env.PRISM_GET_USERS_URL : '';
    const prismHost = process.env.PRISM_HOST ? process.env.PRISM_HOST : '';
    if (prismUrl == '') {
      isPrismWorking = 0;
    }
    const prismBaseUrl = prismUrl + '/data';
    const prismHeaders = {
      method: 'get',
      headers: { Host: prismHost },
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    homeLogger('PRISM_GET_AUTHTOKEN_API_CALL___START');
    const apiUrl = `${prismBaseUrl}/getauthtoken?mobile=${mobileNumber}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
      'getCurrentPatients()->API_CALL_STARTING',
      '',
      ''
    );
    let uhids;
    try {
      const prismAuthToken = await fetch(apiUrl, prismHeaders)
        .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
        .catch((prismGetAuthTokenError: PrismGetAuthTokenError) => {
          homeLogger('PRISM_GET_AUTHTOKEN_API_CALL___ERROR_END');
          log(
            'profileServiceLogger',
            'API_CALL_ERROR',
            'getCurrentPatients()->CATCH_BLOCK',
            '',
            JSON.stringify(prismGetAuthTokenError)
          );
          // throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR, undefined, {
          //   prismGetAuthTokenError,
          // });
          isPrismWorking = 0;
        });
      homeLogger('PRISM_GET_AUTHTOKEN_API_CALL___END');
      log(
        'profileServiceLogger',
        'API_CALL_RESPONSE',
        'getCurrentPatients()->API_CALL_RESPONSE',
        JSON.stringify(prismAuthToken),
        ''
      );
      console.log(prismAuthToken, 'prismAuthToken');

      if (prismAuthToken != null) {
        const getUserApiUrl = `${prismBaseUrl}/getusers?authToken=${prismAuthToken.response}&mobile=${mobileNumber}`;
        homeLogger('PRISM_GET_USERS_API_CALL___START');
        log(
          'profileServiceLogger',
          `EXTERNAL_API_CALL_PRISM: ${getUserApiUrl}`,
          'getCurrentPatients()->prismGetUsersApiCall->API_CALL_STARTING',
          '',
          ''
        );

        uhids = await fetch(getUserApiUrl, prismHeaders)
          .then((res) => res.json() as Promise<PrismGetUsersResponse>)
          .catch((prismGetUsersError: PrismGetUsersError) => {
            homeLogger('PRISM_GET_USERS_API_CALL___ERROR_END');
            log(
              'profileServiceLogger',
              'API_CALL_ERROR',
              'getCurrentPatients()->prismGetUsersApiCall->CATCH_BLOCK',
              '',
              JSON.stringify(prismGetUsersError)
            );
            // throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR, undefined, {
            //   prismGetUsersError,
            // });
            isPrismWorking = 0;
          });
      }

      homeLogger('PRISM_GET_USERS_API_CALL___END');
      log(
        'profileServiceLogger',
        'API_CALL_RESPONSE',
        'getCurrentPatients()->prismGetUsersApiCall->API_CALL_RESPONSE',
        JSON.stringify(uhids),
        ''
      );

      console.log(uhids, 'uhid', isPrismWorking);
    } catch (e) {
      isPrismWorking = 0;
    }

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
      homeLogger('CREATE_OR_RETURN_PATIENTS_START');

      //isPatientInPrism = uhids.response && uhids.response.signUpUserData;
      patientPromises = uhids.response!.signUpUserData.map((data) => {
        return findOrCreatePatient(
          { uhid: data.UHID, mobileNumber },
          {
            firstName: data.userName,
            lastName: '',
            gender: undefined,
            mobileNumber,
            uhid: data.UHID,
          }
        );
      });
    } else {
      isPrismWorking = 0;
    }

    //if prism is not working - process with 24x7 database
    isPrismWorking = 0;
    const checkPatients = await patientRepo.findByMobileNumber(mobileNumber);
    if (isPrismWorking == 0) {
      if (checkPatients == null || checkPatients.length == 0) {
        homeLogger('CREATE_OR_RETURN_PATIENTS_START');
        patientPromises = [
          findOrCreatePatient(
            { uhid: '', mobileNumber },
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
    console.log(updatePatients);
    homeLogger('CREATE_OR_RETURN_PATIENTS_END');

    /*
  checkPatients.map(async (patient) => {
    if ((patient.uhid == '' || patient.uhid == null) && patient.firstName.trim() != '') {
      await patientRepo.createNewUhid(patient.id);
    }
  });*/

    homeLogger('ASYNC_UPDATE_APP_VERSION_START');
    patients = await patientRepo.findByMobileNumber(mobileNumber);

    if (args.appVersion && args.deviceType) {
      const versionUpdateRecords = patients.map((patient) => {
        return args.deviceType === DEVICE_TYPE.ANDROID
          ? { id: patient.id, androidVersion: args.appVersion }
          : { id: patient.id, iosVersion: args.appVersion };
      });
      console.log('verionUpdateRecords =>', versionUpdateRecords);
      log(
        'profileServiceLogger',
        'DEBUG_LOG',
        'getCurrentPatients()->updateAppVersion',
        JSON.stringify(versionUpdateRecords),
        ''
      );
      const updatedProfiles = patientRepo.updateProfiles(versionUpdateRecords);
      console.log('updatePatientProfiles', updatedProfiles);
      log(
        'profileServiceLogger',
        'DEBUG_LOG',
        'getCurrentPatients()->updateAppVersion',
        JSON.stringify(updatedProfiles),
        ''
      );
    }
    homeLogger('ASYNC_UPDATE_APP_VERSION_END');

    homeLogger('API_CALL___END');
  }
  return { patients };
};

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
  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
    'getCurrentPatients()->API_CALL_STARTING',
    '',
    ''
  );

  const prismAuthToken = await fetch(apiUrl, prismHeaders)
    .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
    .catch((prismGetAuthTokenError: PrismGetAuthTokenError) => {
      log(
        'profileServiceLogger',
        'API_CALL_ERROR',
        'getCurrentPatients()->CATCH_BLOCK',
        '',
        JSON.stringify(prismGetAuthTokenError)
      );
      // throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR, undefined, {
      //   prismGetAuthTokenError,
      // });
      isPrismWorking = 0;
    });
  log(
    'profileServiceLogger',
    'API_CALL_RESPONSE',
    'getCurrentPatients()->API_CALL_RESPONSE',
    JSON.stringify(prismAuthToken),
    ''
  );
  console.log(prismAuthToken, 'prismAuthToken');

  let uhids;
  if (prismAuthToken != null) {
    const getUserApiUrl = `${prismBaseUrl}/getusers?authToken=${prismAuthToken.response}&mobile=${mobileNumber}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${getUserApiUrl}`,
      'getCurrentPatients()->prismGetUsersApiCall->API_CALL_STARTING',
      '',
      ''
    );

    uhids = await fetch(getUserApiUrl, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetUsersResponse>)
      .catch((prismGetUsersError: PrismGetUsersError) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getCurrentPatients()->prismGetUsersApiCall->CATCH_BLOCK',
          '',
          JSON.stringify(prismGetUsersError)
        );
        // throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR, undefined, {
        //   prismGetUsersError,
        // });
        isPrismWorking = 0;
      });
  }

  log(
    'profileServiceLogger',
    'API_CALL_RESPONSE',
    'getCurrentPatients()->prismGetUsersApiCall->API_CALL_RESPONSE',
    JSON.stringify(uhids),
    ''
  );

  console.log(uhids, 'uhid', isPrismWorking);
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
          gender: undefined,
          mobileNumber,
          uhid: data.UHID,
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
  console.log(updatePatients);
  /*
  checkPatients.map(async (patient) => {
    if ((patient.uhid == '' || patient.uhid == null) && patient.firstName.trim() != '') {
      await patientRepo.createNewUhid(patient.id);
    }
  });*/
  const patients = await patientRepo.findByMobileNumber(mobileNumber);

  if (args.appVersion && args.deviceType) {
    const versionUpdateRecords = patients.map((patient) => {
      return args.deviceType === DEVICE_TYPE.ANDROID
        ? { id: patient.id, androidVersion: args.appVersion }
        : { id: patient.id, iosVersion: args.appVersion };
    });
    console.log('verionUpdateRecords =>', versionUpdateRecords);
    log(
      'profileServiceLogger',
      'DEBUG_LOG',
      'getCurrentPatients()->updateAppVersion',
      JSON.stringify(versionUpdateRecords),
      ''
    );
    const updatedProfiles = patientRepo.updateProfiles(versionUpdateRecords);
    console.log('updatePatientProfiles', updatedProfiles);
    log(
      'profileServiceLogger',
      'DEBUG_LOG',
      'getCurrentPatients()->updateAppVersion',
      JSON.stringify(updatedProfiles),
      ''
    );
  }

  return { patients };
};

export const getCurrentPatientsResolvers = {
  Patient: {
    async __resolveReference(object: Patient) {
      const connection = getConnection();
      const patientsRepo = connection.getRepository(Patient);
      const patientDetails = await patientsRepo.findOne({ where: { id: object.id } });
      return patientDetails;
    },
  },
  Query: {
    getCurrentPatients,
    getLoginPatients,
  },
};
