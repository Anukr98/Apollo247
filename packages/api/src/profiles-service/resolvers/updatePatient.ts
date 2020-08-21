import gql from 'graphql-tag';
import { Patient, Relation } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { sendNotificationSMS } from 'notifications-service/handlers';
import { trim } from 'lodash';
import { isValidReferralCode } from '@aph/universal/dist/aphValidators';

import {
  ReferralCodesMasterRepository,
  ReferalCouponMappingRepository,
} from 'profiles-service/repositories/couponRepository';
import { ApiConstants, PATIENT_REPO_RELATIONS } from 'ApiConstants';
import { createPrismUser } from 'helpers/phrV1Services';
import { getCache, delCache, setCache } from 'profiles-service/database/connectRedis';

const REDIS_PATIENT_LOCK_PREFIX = `patient:lock:`;
export const updatePatientTypeDefs = gql`
  input UpdatePatientInput {
    id: ID!
    firstName: String
    lastName: String
    mobileNumber: String
    gender: Gender
    uhid: String
    emailAddress: String
    dateOfBirth: Date
    referralCode: String
    relation: Relation
    photoUrl: String
    deviceCode: String
    employeeId: String
    partnerId: String
  }

  input UpdatePatientAllergiesInput {
    id: ID!
    allergies: String!
  }

  type UpdatePatientResult {
    patient: Patient
  }

  extend type Mutation {
    updatePatient(patientInput: UpdatePatientInput): UpdatePatientResult!
    updatePatientAllergies(patientId: String!, allergies: String!): UpdatePatientResult!
  }
`;

type UpdatePatientResult = {
  patient: Patient | null;
};

type UpdatePatientArgs = { patientInput: Partial<Patient> & { id: Patient['id'] } };
const updatePatient: Resolver<
  null,
  UpdatePatientArgs,
  ProfilesServiceContext,
  UpdatePatientResult
> = async (parent, { patientInput }, { profilesDb }) => {
  const { ...updateAttrs } = patientInput;
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  if (patientInput.employeeId && patientInput.partnerId) {
    const checkEmployeeId = await patientRepo.findEmpId(
      patientInput.employeeId,
      patientInput.id,
      patientInput.partnerId
    );
    if (checkEmployeeId) {
      throw new AphError(AphErrorMessages.INVALID_EMPLOYEE_ID, undefined, {});
    }
  }

  if (updateAttrs.referralCode && trim(updateAttrs.referralCode).length > 0) {
    const referralCode = updateAttrs.referralCode.toUpperCase();
    if (!isValidReferralCode(referralCode))
      throw new AphError(AphErrorMessages.INVALID_REFERRAL_CODE);
    updateAttrs.referralCode = referralCode;
  }

  const patient = await patientRepo.getPatientDetails(patientInput.id);
  if (!patient || patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const lockKey = `${REDIS_PATIENT_LOCK_PREFIX}${patient.mobileNumber}`;
  const lockedProfile = await getCache(lockKey);
  if (lockedProfile && typeof lockedProfile == 'string') {
    throw new Error(AphErrorMessages.PROFILE_CREATION_IN_PROGRESS);
  }
  Object.assign(patient, updateAttrs);
  if (patient.uhid == '' || patient.uhid == null) {
    await setCache(lockKey, 'true', ApiConstants.CACHE_EXPIRATION_120);
    const uhidResp = await patientRepo.getNewUhid(patient);
    if (uhidResp.retcode == '0') {
      patient.uhid = uhidResp.result;
      patient.primaryUhid = uhidResp.result;
      patient.uhidCreatedDate = new Date();
      await createPrismUser(patient, uhidResp.result.toString()).catch(async (err) => {
        await delCache(lockKey);
        throw new Error(AphErrorMessages.PRISM_CREATE_UHID_ERROR);
      });
    }
  }
  await patient.save();
  await delCache(lockKey);
  //Doubt: Do we need to check getPatientList.length == 1 since it is getting called only on first call

  // const getPatientList = await patientRepo.findByMobileNumber(patient.mobileNumber);
  if (patient.relation == Relation.ME) {
    //send registration success notification here
    // sendPatientRegistrationNotification(updatePatient, profilesDb, regCode);
    if (updateAttrs.referralCode) {
      const referralCodesMasterRepo = profilesDb.getCustomRepository(ReferralCodesMasterRepository);
      const referralCodeExist = await referralCodesMasterRepo.findByReferralCode(
        updateAttrs.referralCode
      );
      let smsText = ApiConstants.REFERRAL_CODE_TEXT.replace('{0}', patient.firstName);
      if (referralCodeExist) {
        const referalCouponMappingRepo = profilesDb.getCustomRepository(
          ReferalCouponMappingRepository
        );
        const mappingData = await referalCouponMappingRepo.findByReferralCodeId(
          referralCodeExist.id
        );
        if (mappingData)
          smsText = ApiConstants.REFERRAL_CODE_TEXT_WITH_COUPON.replace(
            '{0}',
            patient.firstName
          ).replace('{1}', mappingData.coupon.code);
        sendNotificationSMS(patient.mobileNumber, smsText);
      } else {
        sendNotificationSMS(patient.mobileNumber, smsText);
      }
    }
  }
  const patientObjWithRelations = await patientRepo.findByIdWithRelations(patientInput.id, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY,
  ]);

  Object.assign(patient, patientObjWithRelations);
  // Object.assign(patient, await patientRepo.getPatientDetails(patientInput.id));
  return { patient };
};

const updatePatientAllergies: Resolver<
  null,
  { patientId: string; allergies: string },
  ProfilesServiceContext,
  UpdatePatientResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  await patientRepo.updatePatientAllergies(args.patientId, args.allergies);

  const patient = await patientRepo.findByIdWithRelations(args.patientId, [
    PATIENT_REPO_RELATIONS.PATIENT_ADDRESS,
    PATIENT_REPO_RELATIONS.FAMILY_HISTORY,
    PATIENT_REPO_RELATIONS.LIFESTYLE,
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY,
  ]);

  if (patient == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  return { patient };
};

export const updatePatientResolvers = {
  Mutation: {
    updatePatient,
    updatePatientAllergies,
  },
};
