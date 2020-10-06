import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorsFavouriteAdvice } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { DoctorFavouriteAdviceRepository } from 'doctors-service/repositories/doctorFavouriteAdviceRepository';

export const doctorFavouriteAdviceTypeDefs = gql`
  type DoctorsFavouriteAdvice {
    id: ID!
    instruction: String!
  }
  type FavouriteAdviceList {
    adviceList: [DoctorsFavouriteAdvice]
  }
  extend type Query {
    getDoctorFavouriteAdviceList: FavouriteAdviceList
  }
  extend type Mutation {
    addDoctorFavouriteAdvice(instruction: String!): FavouriteAdviceList
    deleteDoctorFavouriteAdvice(instructionId: ID!): FavouriteAdviceList
    updateDoctorFavouriteAdvice(id: ID!, instruction: String!): FavouriteAdviceList
  }
`;

type FavouriteAdviceList = {
  adviceList: DoctorsFavouriteAdvice[];
};

const getDoctorFavouriteAdviceList: Resolver<
  null,
  {},
  DoctorsServiceContext,
  FavouriteAdviceList
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.searchDoctorByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteAdviceRepo = doctorsDb.getCustomRepository(DoctorFavouriteAdviceRepository);
  const favouriteAdviceList = await favouriteAdviceRepo.getDoctorAdviceList(doctordata.id);
  return { adviceList: favouriteAdviceList };
};

const addDoctorFavouriteAdvice: Resolver<
  null,
  { instruction: string },
  DoctorsServiceContext,
  FavouriteAdviceList
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  if (args.instruction.trim().length == 0) throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.searchDoctorByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteAdviceRepo = doctorsDb.getCustomRepository(DoctorFavouriteAdviceRepository);

  //save advice
  const adviceInput: Partial<DoctorsFavouriteAdvice> = { ...args, doctor: doctordata };
  await favouriteAdviceRepo.saveDoctorFavouriteAdvice(adviceInput);

  const favouriteAdviceList = await favouriteAdviceRepo.getDoctorAdviceList(doctordata.id);
  return { adviceList: favouriteAdviceList };
};

const deleteDoctorFavouriteAdvice: Resolver<
  null,
  { instructionId: string },
  DoctorsServiceContext,
  FavouriteAdviceList
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  if (args.instructionId.trim().length == 0) throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.searchDoctorByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteAdviceRepo = doctorsDb.getCustomRepository(DoctorFavouriteAdviceRepository);

  // check if instructionid exists

  const getAdviceById = await favouriteAdviceRepo.getDoctorAdviceById(
    doctordata.id,
    args.instructionId
  );
  if (getAdviceById.length == 0) throw new AphError(AphErrorMessages.INVALID_ADVICE_ID);

  //delete advice
  await favouriteAdviceRepo.deleteAdvice(args.instructionId);

  const favouriteAdviceList = await favouriteAdviceRepo.getDoctorAdviceList(doctordata.id);
  return { adviceList: favouriteAdviceList };
};

const updateDoctorFavouriteAdvice: Resolver<
  null,
  { id: string; instruction: string },
  DoctorsServiceContext,
  FavouriteAdviceList
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  if (args.id.trim().length == 0 || args.instruction.trim().length == 0)
    throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.searchDoctorByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteAdviceRepo = doctorsDb.getCustomRepository(DoctorFavouriteAdviceRepository);

  //update advice
  const adviceInput: Partial<DoctorsFavouriteAdvice> = { ...args, doctor: doctordata };
  await favouriteAdviceRepo.saveDoctorFavouriteAdvice(adviceInput);

  const favouriteAdviceList = await favouriteAdviceRepo.getDoctorAdviceList(doctordata.id);
  return { adviceList: favouriteAdviceList };
};

export const doctorFavouriteAdviceResolvers = {
  Mutation: {
    addDoctorFavouriteAdvice,
    deleteDoctorFavouriteAdvice,
    updateDoctorFavouriteAdvice,
  },

  Query: {
    getDoctorFavouriteAdviceList,
  },
};
