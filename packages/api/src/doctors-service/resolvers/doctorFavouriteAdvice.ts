import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { getConnection } from 'typeorm';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorsFavouriteAdvice } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { DoctorFavouriteAdviceRepository } from 'doctors-service/repositories/doctorFavouriteAdviceRepository';

export const doctorFavouriteAdviceTypeDefs = gql`
  type DoctorsFavouriteAdvice {
    id: ID!
    instruction: String
  }
  type FavouriteAdviceList {
    adviceList: [DoctorsFavouriteAdvice]
  }
  extend type Query {
    getDoctorFavouriteAdviceList: FavouriteAdviceList
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
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb, firebaseUid }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  let doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteAdviceRepo = doctorsDb.getCustomRepository(DoctorFavouriteAdviceRepository);
  const favouriteAdviceList = await favouriteAdviceRepo.getDoctorFavouriteAdviceList(doctordata.id);
  return { adviceList: favouriteAdviceList };
};

export const doctorFavouriteAdviceResolvers = {
  Query: {
    getDoctorFavouriteAdviceList,
  },
};
