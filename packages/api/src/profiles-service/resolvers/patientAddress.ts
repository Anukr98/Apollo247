import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientAddress, PATIENT_ADDRESS_TYPE } from 'profiles-service/entities';
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
    mobileNumber: String
    landmark: String
    addressType: PATIENT_ADDRESS_TYPE
    otherAddressType: String
    latitude: Float
    longitude: Float
  }

  enum PATIENT_ADDRESS_TYPE {
    HOME
    OFFICE
    OTHER
  }

  input UpdatePatientAddressInput {
    id: ID!
    addressLine1: String!
    addressLine2: String
    city: String
    state: String
    zipcode: String!
    mobileNumber: String
    landmark: String
    addressType: PATIENT_ADDRESS_TYPE
    otherAddressType: String
    latitude: Float
    longitude: Float
  }

  type PatientAddress {
    id: ID!
    addressLine1: String
    addressLine2: String
    city: String
    mobileNumber: String
    state: String
    zipcode: String
    landmark: String
    createdDate: Date
    updatedDate: Date
    addressType: PATIENT_ADDRESS_TYPE
    otherAddressType: String
    latitude: Float
    longitude: Float
  }

  type AddPatientAddressResult {
    patientAddress: PatientAddress
  }

  type patientAddressListResult {
    addressList: [PatientAddress!]
  }

  type DeletePatientAddressResult {
    status: Boolean
  }

  extend type Query {
    getPatientAddressList(patientId: String): patientAddressListResult!
    getPatientAddressById(id: String): AddPatientAddressResult!
  }

  extend type Mutation {
    savePatientAddress(PatientAddressInput: PatientAddressInput): AddPatientAddressResult!
    updatePatientAddress(
      UpdatePatientAddressInput: UpdatePatientAddressInput
    ): AddPatientAddressResult
    deletePatientAddress(id: String): DeletePatientAddressResult!
  }
`;
type PatientAddressInput = {
  patientId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  mobileNumber: string;
  state: string;
  zipcode: string;
  landmark: string;
  addressType: PATIENT_ADDRESS_TYPE;
  otherAddressType: string;
  latitude: number;
  longitude: number;
};

type UpdatePatientAddressInput = {
  id: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  mobileNumber: string;
  state: string;
  zipcode: string;
  landmark: string;
  addressType: PATIENT_ADDRESS_TYPE;
  otherAddressType: string;
  latitude: number;
  longitude: number;
};

type PatientAddressInputArgs = { PatientAddressInput: PatientAddressInput };
type UpdatePatientAddressInputArgs = { UpdatePatientAddressInput: UpdatePatientAddressInput };

type AddPatientAddressResult = {
  patientAddress: PatientAddress;
};

type patientAddressListResult = {
  addressList: PatientAddress[];
};

type DeletePatientAddressResult = {
  status: Boolean;
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

const getPatientAddressById: Resolver<
  null,
  { id: string },
  ProfilesServiceContext,
  AddPatientAddressResult
> = async (parent, args, { profilesDb }) => {
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const patientAddress = await patientAddressRepo.findById(args.id);
  if (patientAddress == null)
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  return { patientAddress };
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
  DeletePatientAddressResult
> = async (parent, args, { profilesDb }) => {
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const deleteResp = await patientAddressRepo.deletePatientAddress(args.id);
  if (!deleteResp) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { status: true };
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
    getPatientAddressById,
  },
};
