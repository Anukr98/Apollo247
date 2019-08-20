import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientAddress } from 'profiles-service/entities';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const addPatientAddressTypeDefs = gql`
  input PatientAddressInput {
    patientId: ID!
    addressLine1: String!
    addressLine2: String
    city: String
    state: String
    zipcode: String!
    landmark: String
  }

  input UpdatePatientAddressInput {
    id: ID!
    addressLine1: String!
    addressLine2: String
    city: String
    state: String
    zipcode: String!
    landmark: String
  }

  type PatientAddress {
    id: ID!
    addressLine1: String
    addressLine2: String
    city: String
    state: String
    zipcode: String
    landmark: String
    createdDate: Date
    updatedDate: Date
  }

  type AddPatientAddressResult {
    patientAddress: PatientAddress
  }

  type patientAddressListResult {
    addressList: [PatientAddress!]
  }

  extend type Query {
    getPatientAddressList(patientId: String): patientAddressListResult!
  }

  extend type Mutation {
    savePatientAddress(PatientAddressInput: PatientAddressInput): AddPatientAddressResult!
    updatePatientAddress(
      UpdatePatientAddressInput: UpdatePatientAddressInput
    ): AddPatientAddressResult
    deletePatientAddress(id: String): Boolean!
  }
`;
type PatientAddressInput = {
  patientId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  landmark: string;
};

type UpdatePatientAddressInput = {
  id: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  landmark: string;
};

type PatientAddressInputArgs = { PatientAddressInput: PatientAddressInput };
type UpdatePatientAddressInputArgs = { UpdatePatientAddressInput: UpdatePatientAddressInput };

type AddPatientAddressResult = {
  patientAddress: PatientAddress;
};

type patientAddressListResult = {
  addressList: PatientAddress[];
};

const getPatientAddressList: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  patientAddressListResult
> = async (parent, args, { profilesDb }) => {
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const addressList = await patientAddressRepo.getPatientAddressList(args.patientId);
  console.log(addressList, 'address list');
  return { addressList };
};

const updatePatientAddress: Resolver<
  null,
  UpdatePatientAddressInputArgs,
  ProfilesServiceContext,
  AddPatientAddressResult
> = async (parent, { UpdatePatientAddressInput }, { profilesDb }) => {
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const updatePatientAddressAttrs: Omit<UpdatePatientAddressInput, 'id'> = {
    ...UpdatePatientAddressInput,
  };
  await patientAddressRepo.updatePatientAddress(
    UpdatePatientAddressInput.id,
    updatePatientAddressAttrs
  );
  const patientAddress = await patientAddressRepo.findById(UpdatePatientAddressInput.id);
  if (!patientAddress) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patientAddress };
};

const deletePatientAddress: Resolver<
  null,
  { id: string },
  ProfilesServiceContext,
  boolean
> = async (parent, args, { profilesDb }) => {
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const deleteResp = await patientAddressRepo.deletePatientAddress(args.id);
  if (!deleteResp) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return true;
};

const savePatientAddress: Resolver<
  null,
  PatientAddressInputArgs,
  ProfilesServiceContext,
  AddPatientAddressResult
> = async (parent, { PatientAddressInput }, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(PatientAddressInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const savePatientaddressAttrs: Partial<PatientAddress> = {
    ...PatientAddressInput,
    patient: patientDetails,
  };
  const patientAddressRepository = profilesDb.getCustomRepository(PatientAddressRepository);
  const patientAddress = await patientAddressRepository.savePatientAddress(savePatientaddressAttrs);

  return { patientAddress };
};

export const addPatientAddressResolvers = {
  Mutation: {
    savePatientAddress,
    updatePatientAddress,
    deletePatientAddress,
  },
  Query: {
    getPatientAddressList,
  },
};
