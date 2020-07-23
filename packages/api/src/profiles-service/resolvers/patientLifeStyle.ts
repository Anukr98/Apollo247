import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientLifeStyle } from 'profiles-service/entities';
import { PatientLifeStyleRepository } from 'profiles-service/repositories/patientLifeStyleRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const patientLifeStyleTypeDefs = gql`
  input PatientLifeStyleInput {
    patientId: ID!
    description: String!
  }

  input UpdatePatientLifeStyleInput {
    id: ID!
    description: String!
  }

  type PatientLifeStyles {
    id: ID!
    description: String
    createdDate: Date
    updatedDate: Date
  }

  type AddPatientLifeStyleResult {
    patientLifeStyle: PatientLifeStyles
  }

  type PatientLifeStyleListResult {
    lifeStyleList: [PatientLifeStyles!]
  }

  extend type Query {
    getPatientLifeStyleList(patientId: String): PatientLifeStyleListResult!
  }

  extend type Mutation {
    savePatientLifeStyle(patientLifeStyleInput: PatientLifeStyleInput): AddPatientLifeStyleResult!
    updatePatientLifeStyle(
      updatePatientLifeStyleInput: UpdatePatientLifeStyleInput
    ): AddPatientLifeStyleResult
    deletePatientLifeStyle(id: String): Boolean!
  }
`;
type PatientLifeStyleInput = {
  patientId: string;
  description: string;
};

type UpdatePatientLifeStyleInput = {
  id: string;
  description: string;
};

type PatientLifeStyles = {
  id: string;
  description: string;
  createdDate: Date;
  updatedDate: Date;
};
type PatientLifeStyleInputInputArgs = { patientLifeStyleInput: PatientLifeStyleInput };
type UpdatePatientLifeStyleInputArgs = { updatePatientLifeStyleInput: UpdatePatientLifeStyleInput };

type AddPatientLifeStyleResult = {
  patientLifeStyle: PatientLifeStyles;
};

type patientLifeStyleListResult = {
  lifeStyleList: PatientLifeStyles[];
};

const getPatientLifeStyleList: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  patientLifeStyleListResult
> = async (parent, args, { profilesDb }) => {
  const patientLifeStyleRepo = profilesDb.getCustomRepository(PatientLifeStyleRepository);
  const lifeStyleList = await patientLifeStyleRepo.getPatientLifeStyleList(args.patientId);
  console.log(lifeStyleList, 'life style list');
  return { lifeStyleList };
};

const updatePatientLifeStyle: Resolver<
  null,
  UpdatePatientLifeStyleInputArgs,
  ProfilesServiceContext,
  AddPatientLifeStyleResult
> = async (parent, { updatePatientLifeStyleInput }, { profilesDb }) => {
  const patientLifeStyleRepo = profilesDb.getCustomRepository(PatientLifeStyleRepository);
  const updatePatientLifeStyleAttrs: Omit<UpdatePatientLifeStyleInput, 'id'> = {
    ...updatePatientLifeStyleInput,
  };
  await patientLifeStyleRepo.updatePatientLifeStyle(
    updatePatientLifeStyleInput.id,
    updatePatientLifeStyleAttrs
  );
  const patientLifeStyle = await patientLifeStyleRepo.findById(updatePatientLifeStyleInput.id);
  if (!patientLifeStyle) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patientLifeStyle };
};

const deletePatientLifeStyle: Resolver<
  null,
  { id: string },
  ProfilesServiceContext,
  boolean
> = async (parent, args, { profilesDb }) => {
  const patientLifeStyleRepo = profilesDb.getCustomRepository(PatientLifeStyleRepository);
  const deleteResp = await patientLifeStyleRepo.deletePatientLifeStyle(args.id);
  if (!deleteResp) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return true;
};

const savePatientLifeStyle: Resolver<
  null,
  PatientLifeStyleInputInputArgs,
  ProfilesServiceContext,
  AddPatientLifeStyleResult
> = async (parent, { patientLifeStyleInput }, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(patientLifeStyleInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const savePatientlifestyleAttrs: Partial<PatientLifeStyle> = {
    ...patientLifeStyleInput,
    patient: patientDetails,
  };
  const patientLifeStyleRepository = profilesDb.getCustomRepository(PatientLifeStyleRepository);
  const patientLifeStyle = await patientLifeStyleRepository.savePatientLifeStyle(
    savePatientlifestyleAttrs
  );

  return { patientLifeStyle };
};

export const patientLifeStyleResolvers = {
  Mutation: {
    savePatientLifeStyle,
    updatePatientLifeStyle,
    deletePatientLifeStyle,
  },
  Query: {
    getPatientLifeStyleList,
  },
};
