import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { Doctor } from 'doctors-service/entities';
import { isMobileNumberValid } from '@aph/universal/dist/aphValidators';

export const delegateFunctionsTypeDefs = gql`
  extend type Query {
    removeDelegateNumber: Profile
  }
  extend type Mutation {
    updateDelegateNumber(delegateNumber: String): Profile
  }
`;

const updateDelegateNumber: Resolver<
  null,
  { delegateNumber: string },
  DoctorsServiceContext,
  Doctor
> = async (parent, args, { mobileNumber, doctorsDb, firebaseUid }) => {
  if (!isMobileNumberValid(args.delegateNumber))
    throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

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
  { mobileNumber, doctorsDb, firebaseUid }
) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  if (doctorData.delegateNumber != null)
    await doctorRepository.updateDelegateNumber(doctorData.id, '');

  const updatedDoctorDetails =
    doctorData.delegateNumber == null
      ? await doctorRepository.getDoctorProfileData(doctorData.id)
      : doctorData;
  if (updatedDoctorDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  return updatedDoctorDetails;
};

export const delegateFunctionsResolvers = {
  Query: {
    removeDelegateNumber,
  },
  Mutation: {
    updateDelegateNumber,
  },
};
