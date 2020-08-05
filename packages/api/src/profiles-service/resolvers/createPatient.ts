import gql from 'graphql-tag';
import { Patient } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { log } from 'customWinstonLogger';

export const createPatientTypeDefs = gql`
  input CreatePatientInput {
    firstName: String
    lastName: String
    mobileNumber: String!
    gender: Gender
    emailAddress: String
    dateOfBirth: Date
    source: PROFILE_SOURCE
  }

  enum PROFILE_SOURCE {
    WEB
    MOBILE
    ORDER_PUNCHING_TOOL
    MFINE
  }

  type CreatePatientResult {
    patient: [Patient]
  }

  extend type Mutation {
    createPatient(createPatientInput: CreatePatientInput): CreatePatientResult!
  }
`;

type CreatePatientResult = {
  patient: Patient[];
};

type CrteatePatientArgs = { createPatientInput: Partial<Patient> };
const createPatient: Resolver<
  null,
  CrteatePatientArgs,
  ProfilesServiceContext,
  CreatePatientResult
> = async (parent, { createPatientInput }, { profilesDb }) => {
  log(
    'profileServiceLogger',
    `CREATE_PROFILE_CALL:${createPatientInput.mobileNumber}`,
    'createProfile',
    JSON.stringify(createPatientInput),
    ''
  );

  const patientRepo = await profilesDb.getCustomRepository(PatientRepository);

  if (!createPatientInput.mobileNumber) {
    throw new AphError(AphErrorMessages.INVALID_MOBILE_NUMBER, undefined, {});
  }

  const patient = await patientRepo.findOrCreatePatient(
    {
      mobileNumber: createPatientInput.mobileNumber,
    },
    createPatientInput
  );
  return { patient };
};

export const createPatientResolvers = {
  Mutation: {
    createPatient,
  },
};
