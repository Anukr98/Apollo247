import gql from 'graphql-tag';
import { Patient, Relation } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { sendNotificationSMS } from 'notifications-service/resolvers/notifications';
import { trim } from 'lodash';
import { isValidReferralCode } from '@aph/universal/dist/aphValidators';

import {
  ReferralCodesMasterRepository,
  ReferalCouponMappingRepository,
} from 'profiles-service/repositories/couponRepository';
import { ApiConstants } from 'ApiConstants';
import { createPrismUser } from 'helpers/phrV1Services';

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

const REDIS_PATIENT_ID_KEY_PREFIX: string = 'patient:';

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

  Object.assign(patient, updateAttrs);
  if (patient.uhid == '' || patient.uhid == null) {
    const uhidResp = await patientRepo.getNewUhid(patient);
    if (uhidResp.retcode == '0') {
      patient.uhid = uhidResp.result;
      patient.primaryUhid = uhidResp.result;
      patient.uhidCreatedDate = new Date();
    }
    createPrismUser(patient, uhidResp.result.toString());
  }
  await patient.save();

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
