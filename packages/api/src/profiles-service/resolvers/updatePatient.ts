import gql from 'graphql-tag';
import { Patient, Relation } from 'profiles-service/entities';
import { BaseEntity } from 'typeorm';
import { AphError, AphUserInputError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { validate } from 'class-validator';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { sendNotificationSMS } from 'notifications-service/resolvers/notifications';
import { trim } from 'lodash';
import { isValidReferralCode } from '@aph/universal/dist/aphValidators';
import { delCache } from 'profiles-service/database/connectRedis';

import {
  ReferralCodesMasterRepository,
  ReferalCouponMappingRepository,
} from 'profiles-service/repositories/couponRepository';
import { ApiConstants, PATIENT_REPO_RELATIONS } from 'ApiConstants';

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

const REDIS_PATIENT_ID_KEY_PREFIX: string = 'patient:';

type UpdatePatientResult = {
  patient: Patient | null;
};

async function updateEntity<E extends BaseEntity>(
  Entity: typeof BaseEntity,
  id: string,
  attrs: Partial<Omit<E, keyof BaseEntity>>
): Promise<E> {
  let entity: E;
  try {
    entity = await Entity.findOneOrFail<E>(id);
    Object.assign(entity, attrs);
    await Entity.save(entity);
  } catch (updateProfileError) {
    throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { updateProfileError });
  }
  const errors = await validate(entity);
  if (errors.length > 0) {
    throw new AphUserInputError(AphErrorMessages.INVALID_ENTITY, { errors });
  }
  return entity;
}

type UpdatePatientArgs = { patientInput: Partial<Patient> & { id: Patient['id'] } };
const updatePatient: Resolver<
  null,
  UpdatePatientArgs,
  ProfilesServiceContext,
  UpdatePatientResult
> = async (parent, { patientInput }, { profilesDb }) => {
  const { id, ...updateAttrs } = patientInput;
  const patientRepo = await profilesDb.getCustomRepository(PatientRepository);
  if (patientInput.employeeId) {
    const checkEmployeeId = await patientRepo.findEmpId(patientInput.employeeId, patientInput.id);
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

  //const patientRepo = await profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientRepo.getPatientDetails(patientInput.id);
  if (!patient || patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const updatePatient = await updateEntity<Patient>(Patient, id, updateAttrs);
  if (updatePatient) {
    if (patient.uhid == '' || patient.uhid == null) {
      console.log('calling createNewUhid');
      await patientRepo.createNewUhid(updatePatient.id);
      await delCache(`${REDIS_PATIENT_ID_KEY_PREFIX}${updatePatient.id}`);
    }
  }

  const getPatientList = await patientRepo.findByMobileNumber(updatePatient.mobileNumber);
  if (updatePatient.relation == Relation.ME || getPatientList.length == 1) {
    //send registration success notification here
    // sendPatientRegistrationNotification(updatePatient, profilesDb, regCode);
    if (updateAttrs.referralCode) {
      const referralCodesMasterRepo = await profilesDb.getCustomRepository(
        ReferralCodesMasterRepository
      );
      const referralCodeExist = await referralCodesMasterRepo.findByReferralCode(
        updateAttrs.referralCode
      );
      let smsText = ApiConstants.REFERRAL_CODE_TEXT.replace('{0}', updatePatient.firstName);
      if (referralCodeExist) {
        const referalCouponMappingRepo = await profilesDb.getCustomRepository(
          ReferalCouponMappingRepository
        );
        const mappingData = await referalCouponMappingRepo.findByReferralCodeId(
          referralCodeExist.id
        );
        if (mappingData)
          smsText = ApiConstants.REFERRAL_CODE_TEXT_WITH_COUPON.replace(
            '{0}',
            updatePatient.firstName
          ).replace('{1}', mappingData.coupon.code);
        sendNotificationSMS(updatePatient.mobileNumber, smsText);
      } else {
        sendNotificationSMS(updatePatient.mobileNumber, smsText);
      }
    }
  }
  Object.assign(patient, await patientRepo.getPatientDetails(patientInput.id));
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
    PATIENT_REPO_RELATIONS.PATIENT_MEDICAL_HISTORY
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
