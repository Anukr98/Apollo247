import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profiles-service';
import { SearchHistory, SEARCH_TYPE } from 'profiles-service/entity/searchHistory';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { Resolver } from 'api-gateway';

export const getPastSearchesTypeDefs = gql`
  type GetPastSearchesResult {
    searchType: SEARCH_TYPE
    typeId: ID
  }

  extend type Query {
    getPastSearches(patientId: ID!): [SearchHistory!]
  }
`;

type GetPastSearchesResult = {
  searchType: SEARCH_TYPE;
  typeId: string;
};

const getPastSearches: Resolver<null, {}, ProfilesServiceContext, SearchHistory[]> = async (
  parent,
  args
) => {
  let searchHistoryData: SearchHistory[];
  try {
    searchHistoryData = await SearchHistory.find({ order: { createdDate: 'DESC' }, take: 10 });
    return searchHistoryData;
  } catch (searchHistoryError) {
    throw new AphError(AphErrorMessages.GET_SEARCH_HISTORY_ERROR, undefined, {
      searchHistoryError,
    });
  }
};

export const getPastSearchesResolvers = {
  Query: {
    getPastSearches,
  },
};
