import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorDeviceTokens, DOCTOR_DEVICE_TYPE } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorDeviceTokenRepository } from 'doctors-service/repositories/doctorDeviceTokenRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const saveDoctorDeviceTokenTypeDefs = gql`
  enum DOCTOR_DEVICE_TYPE {
    IOS
    ANDROID
    DESKTOP
  }

  input SaveDoctorDeviceTokenInput {
    deviceType: DOCTOR_DEVICE_TYPE!
    deviceToken: String!
    deviceOS: String!
    doctorId: ID!
  }

  type DoctorDeviceTokens {
    id: ID!
    doctorId: ID!
    deviceType: DOCTOR_DEVICE_TYPE!
    deviceOS: String!
    deviceToken: String!
    createdDate: Date!
    updatedDate: Date
  }

  type DoctorDeviceTokenResult {
    deviceToken: DoctorDeviceTokens
  }

  type DoctorDeleteTokenResult {
    status: Boolean
  }

  extend type Mutation {
    saveDoctorDeviceToken(
      SaveDoctorDeviceTokenInput: SaveDoctorDeviceTokenInput
    ): DoctorDeviceTokenResult!
    deleteDoctorDeviceToken(deviceToken: String, doctorId: String): DoctorDeleteTokenResult
  }
`;

type DoctorDeleteTokenResult = {
  status: boolean;
};

type SaveDoctorDeviceTokenInput = {
  deviceType: DOCTOR_DEVICE_TYPE;
  deviceToken: string;
  deviceOS: string;
  doctorId: string;
};

type DoctorDeviceTokenResult = {
  deviceToken: DoctorDeviceTokens;
};

type SaveDoctorDeviceTokenInputArgs = { SaveDoctorDeviceTokenInput: SaveDoctorDeviceTokenInput };

const saveDoctorDeviceToken: Resolver<
  null,
  SaveDoctorDeviceTokenInputArgs,
  DoctorsServiceContext,
  DoctorDeviceTokenResult
> = async (parent, { SaveDoctorDeviceTokenInput }, { doctorsDb }) => {
  const deviceTokenRepo = doctorsDb.getCustomRepository(DoctorDeviceTokenRepository);
  let deviceToken: DoctorDeviceTokens;
  const devToken = await deviceTokenRepo.findDeviceToken(
    SaveDoctorDeviceTokenInput.doctorId,
    SaveDoctorDeviceTokenInput.deviceToken
  );
  if (devToken) {
    deviceToken = devToken;
    return { deviceToken };
  }
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorDetails = await doctorRepo.findById(SaveDoctorDeviceTokenInput.doctorId);
  if (!doctorDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  const saveDoctorDeviceTokensAttrs: Partial<DoctorDeviceTokens> = {
    ...SaveDoctorDeviceTokenInput,
    doctor: doctorDetails,
  };

  deviceToken = await deviceTokenRepo.saveDoctorDeviceToken(saveDoctorDeviceTokensAttrs);
  return { deviceToken };
};

const deleteDoctorDeviceToken: Resolver<
  null,
  { deviceToken: string; doctorId: string },
  DoctorsServiceContext,
  DoctorDeleteTokenResult
> = async (parent, args, { doctorsDb }) => {
  const deviceTokenRepo = doctorsDb.getCustomRepository(DoctorDeviceTokenRepository);
  const tokenDetails = await deviceTokenRepo.findDeviceToken(args.doctorId, args.deviceToken);
  if (tokenDetails == null)
    throw new AphError(AphErrorMessages.NO_DEVICE_TOKEN_EXIST, undefined, {});
  await deviceTokenRepo.deleteDeviceToken(tokenDetails.deviceToken);
  return { status: true };
};

export const saveDoctorDeviceTokenResolvers = {
  Mutation: {
    saveDoctorDeviceToken,
    deleteDoctorDeviceToken,
  },
};
