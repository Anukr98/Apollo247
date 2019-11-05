import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientDeviceTokens, DEVICE_TYPE } from 'profiles-service/entities';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const saveDeviceTokenTypeDefs = gql`
  enum DEVICE_TYPE {
    IOS
    ANDROID
  }

  input SaveDeviceTokenInput {
    deviceType: DEVICE_TYPE!
    deviceToken: String!
    deviceOS: String!
    patientId: ID!
  }

  type PatientDeviceTokens {
    id: ID!
    patientId: ID!
    deviceType: DEVICE_TYPE!
    deviceOS: String!
    deviceToken: String!
    createdDate: Date!
    updatedDate: Date
  }

  type DeviceTokenResult {
    deviceToken: PatientDeviceTokens
  }

  type DeleteTokenResult {
    status: Boolean!
  }

  extend type Mutation {
    saveDeviceToken(SaveDeviceTokenInput: SaveDeviceTokenInput): DeviceTokenResult!
    deleteDeviceToken(tokenId: String): DeleteTokenResult!
  }
`;

type SaveDeviceTokenInput = {
  deviceType: DEVICE_TYPE;
  deviceToken: string;
  deviceOS: string;
  patientId: string;
};

type DeviceTokenResult = {
  deviceToken: PatientDeviceTokens;
};

type SaveDeviceTokenInputArgs = { SaveDeviceTokenInput: SaveDeviceTokenInput };

const saveDeviceToken: Resolver<
  null,
  SaveDeviceTokenInputArgs,
  ProfilesServiceContext,
  DeviceTokenResult
> = async (parent, { SaveDeviceTokenInput }, { profilesDb }) => {
  const deviceTokenRepo = profilesDb.getCustomRepository(PatientDeviceTokenRepository);
  let deviceToken: PatientDeviceTokens;
  const devToken = await deviceTokenRepo.findDeviceToken(
    SaveDeviceTokenInput.patientId,
    SaveDeviceTokenInput.deviceToken
  );
  if (devToken) {
    deviceToken = devToken;
    return { deviceToken };
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(SaveDeviceTokenInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const savePatientDeviceTokensAttrs: Partial<PatientDeviceTokens> = {
    ...SaveDeviceTokenInput,
    patient: patientDetails,
  };

  deviceToken = await deviceTokenRepo.savePatientDeviceToken(savePatientDeviceTokensAttrs);
  return { deviceToken };
};

type DeleteTokenResult = {
  status: Boolean;
};

const deleteDeviceToken: Resolver<
  null,
  { tokenId: string },
  ProfilesServiceContext,
  DeleteTokenResult
> = async (parent, args, { profilesDb }) => {
  const deviceTokenRepo = profilesDb.getCustomRepository(PatientDeviceTokenRepository);
  await deviceTokenRepo.deleteDeviceToken(args.tokenId);
  return { status: true };
};

export const saveDeviceTokenResolvers = {
  Mutation: {
    saveDeviceToken,
    deleteDeviceToken,
  },
};
