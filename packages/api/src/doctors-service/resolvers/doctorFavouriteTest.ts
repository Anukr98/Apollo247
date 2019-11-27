import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { getConnection } from 'typeorm';
import { DoctorsFavouriteTests } from 'doctors-service/entities';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorFavouriteTestRepository } from 'doctors-service/repositories/doctorFavouriteTestRepository';

export const doctorFavouriteTestTypeDefs = gql`
  type DoctorsFavouriteTests {
    id: ID!
    itemname: String
  }
  type FavouriteTestList {
    testList: [DoctorsFavouriteTests]
  }
  extend type Query {
    getDoctorFavouriteTestList: FavouriteTestList
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
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb, firebaseUid }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  let doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteTestRepository);
  const FavouriteTestList = await favouriteTestRepo.getDoctorFavouriteTestList(doctordata.id);
  return { testList: FavouriteTestList };
};

export const doctorFavouriteTestResolvers = {
  Query: {
    getDoctorFavouriteTestList,
  },
};
