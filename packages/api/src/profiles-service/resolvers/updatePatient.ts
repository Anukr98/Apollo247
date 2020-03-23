import gql from 'graphql-tag';
import { Patient, Relation } from 'profiles-service/entities';
import { BaseEntity } from 'typeorm';
import { AphError, AphUserInputError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { validate } from 'class-validator';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  sendPatientRegistrationNotification,
  sendNotificationSMS,
} from 'notifications-service/resolvers/notifications';
import { trim } from 'lodash';
import { isValidReferralCode } from '@aph/universal/dist/aphValidators';
import { RegistrationCodesRepository } from 'profiles-service/repositories/registrationCodesRepository';
import {
  ReferralCodesMasterRepository,
  ReferalCouponMappingRepository,
} from 'profiles-service/repositories/couponRepository';
import { ApiConstants } from 'ApiConstants';

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

async function updateEntity<E extends BaseEntity>(
  Entity: typeof BaseEntity,
  id: string,
  attrs: Partial<Omit<E, keyof BaseEntity>>
): Promise<E> {
  let entity: E;
  try {
    entity = await Entity.findOneOrFail<E>(id);
    await Entity.update(id, attrs);
    await entity.reload();
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

  //check for referal code validation
  if (updateAttrs.referralCode && trim(updateAttrs.referralCode).length > 0) {
    const referralCode = updateAttrs.referralCode.toUpperCase();
    updateAttrs.referralCode = referralCode;
    if (!isValidReferralCode(referralCode))
      throw new AphError(AphErrorMessages.INVALID_REFERRAL_CODE);
  }

  const patientRepo = await profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientRepo.findById(patientInput.id);
  if (!patient || patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const updatePatient = await updateEntity<Patient>(Patient, id, updateAttrs);
  if (updatePatient) {
    if (patient.uhid == '' || patient.uhid == null) {
      await patientRepo.createNewUhid(updatePatient.id);
    }
  }

  let regCode = '';
  const regCodeRepo = profilesDb.getCustomRepository(RegistrationCodesRepository);
  const getCode = await regCodeRepo.updateCodeStatus('', patient);
  if (getCode) {
    regCode = getCode[0].registrationCode;
  }

  const getPatientList = await patientRepo.findByMobileNumber(updatePatient.mobileNumber);
  console.log(getPatientList, 'getPatientList for count');
  if (updatePatient.relation == Relation.ME || getPatientList.length == 1) {
    //send registration success notification here
    sendPatientRegistrationNotification(patient, profilesDb, regCode);
    if (updateAttrs.referralCode) {
      const referralCodesMasterRepo = await profilesDb.getCustomRepository(
        ReferralCodesMasterRepository
      );
      const referralCodeExist = await referralCodesMasterRepo.findByReferralCode(
        updateAttrs.referralCode
      );
      let smsText = ApiConstants.REFERRAL_CODE_TEXT.replace('{0}', patient.firstName);
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
            patient.firstName
          ).replace('{1}', mappingData.coupon.code);
        sendNotificationSMS(patient.mobileNumber, smsText);
      } else {
        sendNotificationSMS(patient.mobileNumber, smsText);
      }
    }
  }
  return { patient };
};

const updatePatientAllergies: Resolver<
  null,
  { patientId: string; allergies: string },
  ProfilesServiceContext,
  UpdatePatientResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const updateAllergies = await patientRepo.updatePatientAllergies(args.patientId, args.allergies);
  console.log(updateAllergies, 'updateAllergies');
  const patient = await patientRepo.findById(args.patientId);
  if (patient == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  return { patient };
};

export const updatePatientResolvers = {
  Mutation: {
    updatePatient,
    updatePatientAllergies,
  },
};
