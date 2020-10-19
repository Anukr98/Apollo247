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
    name: String
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
    stateCode: String
    defaultAddress: Boolean
  }

  enum PATIENT_ADDRESS_TYPE {
    HOME
    OFFICE
    OTHER
  }

  input UpdatePatientAddressInput {
    id: ID!
    name: String
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
    stateCode: String
    defaultAddress: Boolean
  }

  type PatientAddress {
    id: ID!
    name: String
    addressLine1: String
    addressLine2: String
    city: String
    defaultAddress: Boolean
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
    stateCode: String
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
    makeAdressAsDefault(patientAddressId: ID!): AddPatientAddressResult
  }
`;
type PatientAddressInput = {
  patientId: string;
  name: string;
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
  stateCode: string;
  defaultAddress: boolean;
};

type UpdatePatientAddressInput = {
  id: string;
  name: string;
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
  stateCode: string;
  defaultAddress: boolean;
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
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(args.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const patients = await patientRepo.getIdsByMobileNumber(patientDetails.mobileNumber);
  const addressResps = await Promise.all(
    patients.map((patient) => {
      return patientAddressRepo.getPatientAddressList(patient.id);
    })
  );
  const addressList = addressResps.reduce((acc, addressResp) => acc.concat(addressResp), []);
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
> = async (parent, { UpdatePatientAddressInput }, { profilesDb, mobileNumber }) => {
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const patientAddressDetails = await patientAddressRepo.findById(UpdatePatientAddressInput.id);
  if (!patientAddressDetails)
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(patientAddressDetails.patientId);
  if (!patientDetails || patientDetails.mobileNumber != mobileNumber)
    throw new AphError(AphErrorMessages.UNAUTHORIZED, undefined, {});

  if (
    UpdatePatientAddressInput.latitude &&
    UpdatePatientAddressInput.longitude &&
    UpdatePatientAddressInput.latitude > 50 &&
    UpdatePatientAddressInput.longitude < 50
  ) {
    const latitude = UpdatePatientAddressInput.latitude;
    UpdatePatientAddressInput.latitude = UpdatePatientAddressInput.longitude;
    UpdatePatientAddressInput.longitude = latitude;
  }

  const updatePatientAddressAttrs: Omit<UpdatePatientAddressInput, 'id'> = {
    ...UpdatePatientAddressInput,
  };

  if (updatePatientAddressAttrs.defaultAddress)
    await patientAddressRepo.markPatientAdrressAsNonDefault(patientAddressDetails.patientId);

  const patientAddress = await patientAddressRepo.updatePatientAddress(
    UpdatePatientAddressInput.id,
    updatePatientAddressAttrs
  );

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
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
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
  const patientDetails = await patientRepo.getPatientDetails(PatientAddressInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  // this is to handle wrong data coming from frontend
  if (
    PatientAddressInput.latitude &&
    PatientAddressInput.longitude &&
    PatientAddressInput.latitude > 50 &&
    PatientAddressInput.longitude < 50
  ) {
    const latitude = PatientAddressInput.latitude;
    PatientAddressInput.latitude = PatientAddressInput.longitude;
    PatientAddressInput.longitude = latitude;
  }

  const savePatientaddressAttrs: Partial<PatientAddress> = {
    ...PatientAddressInput,
    patient: patientDetails,
  };

  const patientAddressRepository = profilesDb.getCustomRepository(PatientAddressRepository);

  if (savePatientaddressAttrs.defaultAddress)
    await patientAddressRepository.markPatientAdrressAsNonDefault(PatientAddressInput.patientId);

  const patientAddress = await patientAddressRepository.savePatientAddress(savePatientaddressAttrs);

  return { patientAddress };
};

const makeAdressAsDefault: Resolver<
  null,
  { patientAddressId: string },
  ProfilesServiceContext,
  AddPatientAddressResult
> = async (parent, args, { profilesDb, mobileNumber }) => {
  //check patientAddressId is valid or not
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const patientAddressDetails = await patientAddressRepo.findById(args.patientAddressId);
  if (!patientAddressDetails)
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});

  if (patientAddressDetails.defaultAddress) return { patientAddress: patientAddressDetails };

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(patientAddressDetails.patientId);
  if (!patientDetails || patientDetails.mobileNumber != mobileNumber)
    throw new AphError(AphErrorMessages.UNAUTHORIZED, undefined, {});

  //make rest of them as non default
  await patientAddressRepo.markPatientAdrressAsNonDefault(patientAddressDetails.patientId);

  const address: Partial<PatientAddress> = {
    defaultAddress: true,
  };

  const patientAddress = (await patientAddressRepo.updatePatientAddress(
    args.patientAddressId,
    address
  )) as PatientAddress;

  return { patientAddress };
};

export const addPatientAddressResolvers = {
  Mutation: {
    savePatientAddress,
    updatePatientAddress,
    deletePatientAddress,
    makeAdressAsDefault,
  },
  Query: {
    getPatientAddressList,
    getPatientAddressById,
  },
};
