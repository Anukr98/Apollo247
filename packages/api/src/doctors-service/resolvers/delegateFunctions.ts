import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import {
  Doctor,
  Secretary,
  DoctorSecretary,
  DoctorPatientExternalConnect,
} from 'doctors-service/entities';
import { isMobileNumberValid } from '@aph/universal/dist/aphValidators';
import { SecretaryRepository } from 'doctors-service/repositories/secretaryRepository';
import { DoctorSecretaryRepository } from 'doctors-service/repositories/doctorSecretary';
import { DoctorPatientExternalConnectRepository } from 'doctors-service/repositories/DoctorPatientExternalConnectRepository';

export const delegateFunctionsTypeDefs = gql`
  type DoctorSecretaryData {
    doctor: Profile
    secretary: Secretary
  }
  type SaveExternalConnectResult {
    status: Boolean
  }
  extend type Mutation {
    updateDelegateNumber(delegateNumber: String): Profile
    removeDelegateNumber: Profile
    addSecretary(secretaryId: ID!): DoctorSecretaryData
    removeSecretary(secretaryId: ID!): DoctorDetails
    updatSaveExternalConnect(
      doctorId: String
      patientId: String
      externalConnect: Boolean
    ): SaveExternalConnectResult
  }

  extend type Query {
    getSecretaryList: [SecretaryDetails]
  }
`;
type SaveExternalConnectResult = {
  status: boolean;
};
const getRepos = ({ doctorsDb }: DoctorsServiceContext) => ({
  externalConnectRepo: doctorsDb.getCustomRepository(DoctorPatientExternalConnectRepository),
});

const updateDelegateNumber: Resolver<
  null,
  { delegateNumber: string },
  DoctorsServiceContext,
  Doctor
> = async (parent, args, { mobileNumber, doctorsDb }) => {
  if (!isMobileNumberValid(args.delegateNumber))
    throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const searchMobileNumberExistence = await doctorRepository.searchDoctorByMobileNumber(
    args.delegateNumber,
    true
  );
  if (searchMobileNumberExistence != null) throw new AphError(AphErrorMessages.INVALID_ENTITY);

  if (doctorData.delegateNumber === args.delegateNumber)
    throw new AphError(AphErrorMessages.NO_CHANGE_IN_DELEGATE_NUMBER);

  await doctorRepository.updateDelegateNumber(doctorData.id, args.delegateNumber);

  const updatedDoctorDetails = await doctorRepository.getDoctorProfileData(doctorData.id);
  if (updatedDoctorDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  return updatedDoctorDetails;
};

const removeDelegateNumber: Resolver<null, {}, DoctorsServiceContext, Doctor> = async (
  parent,
  args,
  { mobileNumber, doctorsDb }
) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  if (doctorData.delegateNumber != null)
    await doctorRepository.updateDelegateNumber(doctorData.id, '');

  const updatedDoctorDetails =
    doctorData.delegateNumber != null
      ? await doctorRepository.getDoctorProfileData(doctorData.id)
      : doctorData;
  if (updatedDoctorDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  return updatedDoctorDetails;
};

const getSecretaryList: Resolver<null, {}, DoctorsServiceContext, Secretary[]> = async (
  parent,
  args,
  { mobileNumber, doctorsDb }
) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const secretaryRepo = doctorsDb.getCustomRepository(SecretaryRepository);
  return await secretaryRepo.getSecretaryList();
};

const addSecretary: Resolver<
  null,
  { secretaryId: string },
  DoctorsServiceContext,
  DoctorSecretary
> = async (parent, args, { mobileNumber, doctorsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //check if secretary id is valid.
  const secretaryRepo = doctorsDb.getCustomRepository(SecretaryRepository);
  const secretaryDetails = await secretaryRepo.getSecretaryById(args.secretaryId);
  if (secretaryDetails == null) throw new AphError(AphErrorMessages.INVALID_SECRETARY_ID);

  //check if secretary & doctor combination already exist
  const doctorSecretaryRepo = doctorsDb.getCustomRepository(DoctorSecretaryRepository);
  const doctorSecretaryRecord = await doctorSecretaryRepo.findRecord(
    doctorData.id,
    secretaryDetails.id
  );

  if (doctorSecretaryRecord)
    throw new AphError(AphErrorMessages.SECRETARY_DOCTOR_COMBINATION_EXIST);

  //insert DoctorSecretary record
  const doctorSecretaryDetails: Partial<DoctorSecretary> = {
    secretary: secretaryDetails,
    doctor: doctorData,
  };

  const doctorSecretary = await doctorSecretaryRepo.saveDoctorSecretary(doctorSecretaryDetails);
  return doctorSecretary;
};

const removeSecretary: Resolver<
  null,
  { secretaryId: string },
  DoctorsServiceContext,
  Doctor
> = async (parent, args, { mobileNumber, doctorsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //check if secretary id is valid.
  const secretaryRepo = doctorsDb.getCustomRepository(SecretaryRepository);
  const secretaryDetails = await secretaryRepo.getSecretaryById(args.secretaryId);
  if (secretaryDetails == null) throw new AphError(AphErrorMessages.INVALID_SECRETARY_ID);

  //check if secretary & doctor combination already exist
  const doctorSecretaryRepo = doctorsDb.getCustomRepository(DoctorSecretaryRepository);
  const doctorSecretaryRecord = await doctorSecretaryRepo.findRecord(
    doctorData.id,
    secretaryDetails.id
  );

  if (doctorSecretaryRecord == null)
    throw new AphError(AphErrorMessages.SECRETARY_DOCTOR_COMBINATION_DOESNOT_EXIST);

  //remove doctor secretary details
  await doctorSecretaryRepo.removeFromDoctorSecretary(doctorSecretaryRecord.id);

  const updatedDoctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (updatedDoctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  return updatedDoctorData;
};
const updatSaveExternalConnect: Resolver<
  null,
  { doctorId: string; patientId: string; externalConnect: boolean },
  DoctorsServiceContext,
  SaveExternalConnectResult
> = async (parent, args, context) => {
  const { externalConnectRepo } = getRepos(context);
  const attrs: Partial<DoctorPatientExternalConnect> = {
    patientId: args.patientId,
    doctorId: args.doctorId,
    externalConnect: args.externalConnect,
  };
  externalConnectRepo.saveExternalConnectData(attrs);
  return { status: true };
};

export const delegateFunctionsResolvers = {
  Mutation: {
    updateDelegateNumber,
    removeDelegateNumber,
    addSecretary,
    removeSecretary,
    updatSaveExternalConnect,
  },

  Query: { getSecretaryList },
};
