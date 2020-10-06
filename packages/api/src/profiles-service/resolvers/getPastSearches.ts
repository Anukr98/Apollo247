import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { searchData, SEARCH_TYPE } from 'profiles-service/mockData/searchData';

export const getPastSearchesTypeDefs = gql`
  enum SEARCH_TYPE {
    DOCTOR
    SPECIALTY
    MEDICINE
    TEST
  }
  type SearchData {
    searchType: SEARCH_TYPE
    typeId: String
    name: String
    image: String
  }
  extend type Query {
    getPastSearches: [SearchData]
  }
`;

export type SearchData = {
  searchType: SEARCH_TYPE;
  typeId: String;
  name: String;
  image: String;
};

const getPastSearches: Resolver<null, {}, ProfilesServiceContext, SearchData[]> = async (
  parent,
  args
) => {
  return searchData;
};

export const getPastSearchesResolvers = {
  Query: {
    getPastSearches,
  },
};
