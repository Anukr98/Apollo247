import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientFamilyHistory, Relation } from 'profiles-service/entities';
import { PatientFamilyHistoryRepository } from 'profiles-service/repositories/patientFamilyHistoryRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const patientFamilyHistoryTypeDefs = gql`
  input PatientFamilyHistoryInput {
    patientId: ID!
    description: String!
    relation: Relation!
  }

  input UpdatePatientFamilyHistoryInput {
    id: ID!
    description: String!
    relation: Relation!
  }

  type PatientFamilyHistoryDetails {
    id: ID!
    description: String
    createdDate: Date
    updatedDate: Date
  }

  type AddPatientFamilyHistoryResult {
    patientFamilyHistory: PatientFamilyHistoryDetails
  }

  type PatientFamilyHistoryListResult {
    familyHistoryList: [PatientFamilyHistoryDetails!]
  }

  extend type Query {
    getPatientFamilyHistoryList(patientId: String): PatientFamilyHistoryListResult!
  }

  extend type Mutation {
    savePatientFamilyHistory(
      patientFamilyHistoryInput: PatientFamilyHistoryInput
    ): AddPatientFamilyHistoryResult!
    updatePatientFamilyHistory(
      updatePatientFamilyHistoryInput: UpdatePatientFamilyHistoryInput
    ): AddPatientFamilyHistoryResult
    deletePatientFamilyHistory(id: String): Boolean!
  }
`;
type PatientFamilyHistoryInput = {
  patientId: string;
  description: string;
  relation: Relation;
};

type UpdatePatientFamilyHistoryInput = {
  id: string;
  description: string;
  relation: Relation;
};

type PatientFamilyHistoryDetails = {
  id: string;
  description: string;
  relation: Relation;
  createdDate: Date;
  updatedDate: Date;
};
type PatientFamilyHistoryInputInputArgs = { patientFamilyHistoryInput: PatientFamilyHistoryInput };
type UpdatePatientFamilyHistoryInputArgs = {
  updatePatientFamilyHistoryInput: UpdatePatientFamilyHistoryInput;
};

type AddPatientFamilyHistoryResult = {
  patientFamilyHistory: PatientFamilyHistoryDetails;
};

type PatientFamilyHistoryListResult = {
  familyHistoryList: PatientFamilyHistoryDetails[];
};

const getPatientFamilyHistoryList: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  PatientFamilyHistoryListResult
> = async (parent, args, { profilesDb }) => {
  const patientFamilyHistoryRepo = profilesDb.getCustomRepository(PatientFamilyHistoryRepository);
  const familyHistoryList = await patientFamilyHistoryRepo.getPatientFamilyHistoryList(
    args.patientId
  );
  console.log(familyHistoryList, 'life style list');
  return { familyHistoryList };
};

const updatePatientFamilyHistory: Resolver<
  null,
  UpdatePatientFamilyHistoryInputArgs,
  ProfilesServiceContext,
  AddPatientFamilyHistoryResult
> = async (parent, { updatePatientFamilyHistoryInput }, { profilesDb }) => {
  const patientFamilyHistoryRepo = profilesDb.getCustomRepository(PatientFamilyHistoryRepository);
  const updatePatientFamilyHistoryAttrs: Omit<UpdatePatientFamilyHistoryInput, 'id'> = {
    ...updatePatientFamilyHistoryInput,
  };
  await patientFamilyHistoryRepo.updatePatientFamilyHistory(
    updatePatientFamilyHistoryInput.id,
    updatePatientFamilyHistoryAttrs
  );
  const patientFamilyHistory = await patientFamilyHistoryRepo.findById(
    updatePatientFamilyHistoryInput.id
  );
  if (!patientFamilyHistory) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patientFamilyHistory };
};

const deletePatientFamilyHistory: Resolver<
  null,
  { id: string },
  ProfilesServiceContext,
  boolean
> = async (parent, args, { profilesDb }) => {
  const patientFamilyHistoryRepo = profilesDb.getCustomRepository(PatientFamilyHistoryRepository);
  const deleteResp = await patientFamilyHistoryRepo.deletePatientFamilyHistory(args.id);
  if (!deleteResp) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return true;
};

const savePatientFamilyHistory: Resolver<
  null,
  PatientFamilyHistoryInputInputArgs,
  ProfilesServiceContext,
  AddPatientFamilyHistoryResult
> = async (parent, { patientFamilyHistoryInput }, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(patientFamilyHistoryInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const savePatientFamilyHistoryAttrs: Partial<PatientFamilyHistory> = {
    ...patientFamilyHistoryInput,
    patient: patientDetails,
  };
  const patientFamilyHistoryRepository = profilesDb.getCustomRepository(
    PatientFamilyHistoryRepository
  );
  const patientFamilyHistory = await patientFamilyHistoryRepository.savePatientFamilyHistory(
    savePatientFamilyHistoryAttrs
  );

  return { patientFamilyHistory };
};

export const patientFamilyHistoryResolvers = {
  Mutation: {
    savePatientFamilyHistory,
    updatePatientFamilyHistory,
    deletePatientFamilyHistory,
  },
  Query: {
    getPatientFamilyHistoryList,
  },
};
