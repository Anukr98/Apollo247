import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { SEARCH_TYPE } from 'profiles-service/entities';
import { SearchHistoryRepository } from 'profiles-service/repositories/searchHistoryRepository';
// import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
// import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';

export const getPatientPastSearchesTypeDefs = gql`
  extend type Query {
    getPatientPastSearches(patientId: ID!): [SearchData]
  }
`;

export type SearchData = {
  searchType: SEARCH_TYPE;
  typeId: String;
  name: String;
  image: String;
};

const getPatientPastSearches: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  SearchData[]
> = async (parent, args, { profilesDb, doctorsDb }) => {
  const searchHistoryRepository = profilesDb.getCustomRepository(SearchHistoryRepository);
  const recentSearches = await searchHistoryRepository.getRecentSearchHistory(args.patientId);
  console.log(recentSearches);
  return [];
};

export const getPatientPastSearchesResolvers = {
  Query: {
    getPatientPastSearches,
  },
};
