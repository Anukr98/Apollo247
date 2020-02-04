import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsFavouriteTests } from 'doctors-service/entities';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorFavouriteTestRepository } from 'doctors-service/repositories/doctorFavouriteTestRepository';

export const doctorFavouriteTestTypeDefs = gql`
  enum DIAGNOSTICS_TYPE {
    TEST
    PACKAGE
  }

  enum TEST_COLLECTION_TYPE {
    CENTER
    HC
  }

  type DoctorsFavouriteTests {
    id: ID!
    itemname: String!
  }
  type FavouriteTestList {
    testList: [DoctorsFavouriteTests]
  }
  extend type Query {
    getDoctorFavouriteTestList: FavouriteTestList
  }
  extend type Mutation {
    addDoctorFavouriteTest(itemname: String!): FavouriteTestList
    deleteDoctorFavouriteTest(testId: ID!): FavouriteTestList
    updateDoctorFavouriteTest(id: ID!, itemname: String!): FavouriteTestList
  }
`;

type FavouriteTestList = {
  testList: DoctorsFavouriteTests[];
};

const getDoctorFavouriteTestList: Resolver<
  null,
  {},
  DoctorsServiceContext,
  FavouriteTestList
> = async (parent, args, { mobileNumber, doctorsDb, patientsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteTestRepository);
  const favouriteTestList = await favouriteTestRepo.getDoctorFavouriteTestList(doctordata.id);

  return { testList: favouriteTestList };
};

const addDoctorFavouriteTest: Resolver<
  null,
  { itemname: string },
  DoctorsServiceContext,
  FavouriteTestList
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteTestRepository);

  if (args.itemname.trim().length == 0) throw new AphError(AphErrorMessages.INVALID_ENTITY);

  //check if test already exists
  const getTestByName = await favouriteTestRepo.getDoctorFavouriteTestByName(
    doctordata.id,
    args.itemname
  );

  if (getTestByName !== null && getTestByName.length > 0)
    throw new AphError(AphErrorMessages.TEST_ALREADY_EXIST);

  //save test
  const testInput: Partial<DoctorsFavouriteTests> = { ...args, doctor: doctordata };
  await favouriteTestRepo.saveDoctorFavouriteTest(testInput);

  const favouriteTestList = await favouriteTestRepo.getDoctorFavouriteTestList(doctordata.id);
  return { testList: favouriteTestList };
};

const deleteDoctorFavouriteTest: Resolver<
  null,
  { testId: string },
  DoctorsServiceContext,
  FavouriteTestList
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  if (args.testId.trim().length == 0) throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteTestRepository);

  //check if test exists
  const getTestById = await favouriteTestRepo.getDoctorFavouriteTestById(
    doctordata.id,
    args.testId
  );
  if (getTestById.length == 0) throw new AphError(AphErrorMessages.INVALID_TEST_ID);

  //delete test
  await favouriteTestRepo.deleteFavouriteTest(args.testId);

  const favouriteTestList = await favouriteTestRepo.getDoctorFavouriteTestList(doctordata.id);
  return { testList: favouriteTestList };
};

const updateDoctorFavouriteTest: Resolver<
  null,
  { id: string; itemname: string },
  DoctorsServiceContext,
  FavouriteTestList
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  if (args.itemname.trim().length == 0) throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteTestRepository);

  //check if test exists
  const getTestById = await favouriteTestRepo.getDoctorFavouriteTestById(doctordata.id, args.id);
  if (getTestById.length == 0) throw new AphError(AphErrorMessages.INVALID_TEST_ID);

  //check for test name exsitence
  const getTestByName = await favouriteTestRepo.checkTestNameWhileUpdate(
    args.itemname.toLowerCase(),
    args.id
  );
  if (getTestByName !== null && getTestByName.length > 0)
    throw new AphError(AphErrorMessages.TEST_ALREADY_EXIST);

  //update test
  const testInput: Partial<DoctorsFavouriteTests> = { ...args, doctor: doctordata };
  await favouriteTestRepo.saveDoctorFavouriteTest(testInput);

  const favouriteTestList = await favouriteTestRepo.getDoctorFavouriteTestList(doctordata.id);
  return { testList: favouriteTestList };
};

export const doctorFavouriteTestResolvers = {
  Mutation: {
    addDoctorFavouriteTest,
    deleteDoctorFavouriteTest,
    updateDoctorFavouriteTest,
  },

  Query: {
    getDoctorFavouriteTestList,
  },
};
