import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, SearchHistory, SEARCH_TYPE } from 'profiles-service/entities';
import { SearchHistoryRepository } from 'profiles-service/repositories/searchHistoryRepository';

export const saveSearchTypeDefs = gql`
  input SaveSearchInput {
    type: SEARCH_TYPE
    typeId: ID!
    patient: ID!
  }

  type SearchHistory {
    id: ID!
    typeId: ID!
    type: SEARCH_TYPE!
    patient: Patient
  }

  type SaveSearchResult {
    saveStatus: Boolean
  }

  extend type Mutation {
    saveSearch(saveSearchInput: SaveSearchInput): SaveSearchResult!
  }
`;

type SaveSearchInput = {
  type: SEARCH_TYPE;
  typeId: string;
  patient: Patient;
};

type SaveSearchInputArgs = { saveSearchInput: SaveSearchInput };

type SaveSearchResult = {
  saveStatus: boolean;
};

const saveSearch: Resolver<
  null,
  SaveSearchInputArgs,
  ProfilesServiceContext,
  SaveSearchResult
> = async (parent, { saveSearchInput }, { profilesDb }) => {
  const saveSearchAttrs: Omit<Partial<SearchHistory>, 'id'> = {
    ...saveSearchInput,
  };
  const searchHistoryRepository = profilesDb.getCustomRepository(SearchHistoryRepository);
  await searchHistoryRepository.saveSearch(saveSearchAttrs);
  return { saveStatus: true };
};

export const saveSearchResolvers = {
  Mutation: {
    saveSearch,
  },
};
