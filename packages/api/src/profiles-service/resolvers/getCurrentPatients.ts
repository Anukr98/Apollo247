import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, DEVICE_TYPE } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';
import { getConnection } from 'typeorm';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { log } from 'customWinstonLogger'
import { Gender } from 'doctors-service/entities';
import { getRegisteredUsers } from 'helpers/phrV1Services';
import { getCache, setCache, delCache } from 'profiles-service/database/connectRedis';
import { ApiConstants } from 'ApiConstants';

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
    partnerId: String
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
  }
`;
const REDIS_PATIENT_LOCK_PREFIX = `patient:lock:`;
export type GetCurrentPatientsResult = {
  patients: Object[] | null;
};

const getCurrentPatients: Resolver<
  null,
  { appVersion: string; deviceType: DEVICE_TYPE },
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { mobileNumber, profilesDb, headers }) => {

  /* Throw error if mobile number is not found in context */
  if (!mobileNumber) {
    log(
      'profileServiceLogger',
      'API_CALL_ERROR',
      'getCurrentPatients()->API_CALL_RESPONSE',
      'HEADER_INVALID_MOBILE_NUMBER',
      JSON.stringify(headers)
    );
    throw new Error(AphErrorMessages.INVALID_MOBILE_NUMBER)
  }

  const findOrCreatePatient = async (
    findOptions: { uhid?: Patient['uhid']; mobileNumber: Patient['mobileNumber']; isActive: true },
    createOptions: Partial<Patient>
  ): Promise<Patient> => {
    const lockKey = `${REDIS_PATIENT_LOCK_PREFIX}${mobileNumber}`;
    const lockedProfile = await getCache(lockKey);
    if (lockedProfile && typeof lockedProfile == 'string') {
      throw new Error(AphErrorMessages.PROFILE_CREATION_IN_PROGRESS);
    } else {
      await setCache(lockKey, 'true', ApiConstants.CACHE_EXPIRATION_120);
      const existingPatient = await Patient.findOne({
        where: { uhid: findOptions.uhid, mobileNumber: findOptions.mobileNumber, isActive: true },
      });

      const patient = existingPatient || Patient.create(createOptions).save();
      await delCache(lockKey);
      return patient;
    }
  };

  let patientPromises: Object[] = [];
  const uhids = await getRegisteredUsers(mobileNumber.replace('+91', ''));

  if (uhids.errorCode == 0) {
    //data exist in PRISM
    patientPromises = uhids.response.map((data) => {
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
          dateOfBirth: !data.dob || data.dob.length == 0 ? undefined : new Date(data.dob),
          androidVersion: args.deviceType === DEVICE_TYPE.ANDROID ? args.appVersion : undefined,
          iosVersion: args.deviceType === DEVICE_TYPE.IOS ? args.appVersion : undefined,
          primaryUhid: data.uhid,
        }
      );
    });
  } else if (uhids.errorCode == -1014) {
    //create new user flow, data not in prism
    patientPromises = [
      findOrCreatePatient(
        { uhid: '', mobileNumber, isActive: true },
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
  } else throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);

  await Promise.all(patientPromises).catch((findOrCreateErrors) => {
    throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { findOrCreateErrors });
  });

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patients = await patientRepo.findByMobileNumberLogin(mobileNumber);

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
  },
};
