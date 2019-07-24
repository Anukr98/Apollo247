import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { SearchHistory, SEARCH_TYPE } from 'profiles-service/entity/searchHistory';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { ProfilesServiceContext } from 'profiles-service/profiles-service';
export const saveSearchTypeDefs = gql`
  enum SEARCH_TYPE {
    DOCTOR
    SPECIALTY
  }

  type SearchHistory @key(fields: "id") {
    id: ID!
    patientId: ID
    searchType: SEARCH_TYPE!
    typeId: ID!
  }

  input SaveSearchInput {
    patientId: ID!
    searchType: SEARCH_TYPE!
    typeId: ID!
  }

  type SaveSearchResult {
    savedSearch: SearchHistory
  }

  extend type Mutation {
    saveSearch(saveSearchInput: SaveSearchInput): SaveSearchResult
  }
`;

type SaveSearchResult = {
  savedSearch: SearchHistory;
};

type SaveSearchInput = {
  patientId: string;
  searchType: SEARCH_TYPE;
  typeId: string;
};

type SearchInputArgs = { saveSearchInput: SaveSearchInput };

const saveSearch: Resolver<
  null,
  SearchInputArgs,
  ProfilesServiceContext,
  SaveSearchResult
> = async (parent, { saveSearchInput }) => {
  // const searchAttrs: Omit<SearchHistory, 'id'> = {
  //   ...saveSearchInput,
  // };
  const savedSearch = await SearchHistory.create(saveSearchInput)
    .save()
    .catch((createErrors) => {
      throw new AphError(AphErrorMessages.SAVE_SEARCH_ERROR, undefined, { createErrors });
    });
  return { savedSearch };
};

export const saveSearchResolvers = {
  Mutation: {
    saveSearch,
  },
};
