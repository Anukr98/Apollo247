import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { searchData, SEARCH_TYPE } from 'profiles-service/mockData/searchData';

export const getSearchesTypeDefs = gql`
  type SearchData1 {
    searchType: String
    typeId: String
    name: String
    image: String
  }
  extend type Query {
    getPastSearches1: [SearchData1]
  }
`;

export type SearchData1 = {
  searchType: string;
  typeId: String;
  name: String;
  image: String;
};

const getPastSearches1: Resolver<null, {}, ProfilesServiceContext, SearchData1[]> = async (
  parent,
  args
) => {
  return searchData;
};

export const getSearchesResolvers = {
  Query: {
    getPastSearches1,
  },
};
