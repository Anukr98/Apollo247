import gql from 'graphql-tag';
import { Patient } from 'profiles-service/entities';
import { BaseEntity } from 'typeorm';
import { AphError, AphUserInputError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { validate } from 'class-validator';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { sendPatientRegistrationNotification } from 'notifications-service/resolvers/notifications';
import { trim } from 'lodash';
import { isValidReferralCode } from '@aph/universal/dist/aphValidators';
import { RegistrationCodesRepository } from 'profiles-service/repositories/registrationCodesRepository';

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

  const updatePatient = await updateEntity<Patient>(Patient, id, updateAttrs);
  const patientRepo = await profilesDb.getCustomRepository(PatientRepository);
  if (updatePatient) {
    if (updatePatient.uhid == '' || updatePatient.uhid == null) {
      await patientRepo.createNewUhid(updatePatient.id);
    }
  }
  const patient = await patientRepo.findById(updatePatient.id);
  if (!patient || patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  let regCode = '';
  if (updateAttrs.referralCode && trim(updateAttrs.referralCode).length > 0) {
    const regCodeRepo = profilesDb.getCustomRepository(RegistrationCodesRepository);
    const getCode = await regCodeRepo.getCode();
    regCode = getCode[0].registrationCode;
    if (getCode.length > 0) {
      await regCodeRepo.updateCodeStatus(getCode[0].id, patient);
    }
  }

  const getPatientList = await patientRepo.findByMobileNumber(updatePatient.mobileNumber);
  if (getPatientList.length == 1) {
    //send registration success notification here
    sendPatientRegistrationNotification(patient, profilesDb, regCode);
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
