import gql from 'graphql-tag';

export const GET_PAST_SEARCHES = gql`
  query GetPastSearches {
    getPastSearches {
      searchType
      typeId
      name
      image
    }
  }
`;

export const SAVE_PATIENT_SEARCH = gql`
  mutation SaveSearch($saveSearchInput: SaveSearchInput) {
    saveSearch(saveSearchInput: $saveSearchInput) {
      saveStatus
    }
  }
`;

export const PATIENT_PAST_SEARCHES = gql`
  query GetPatientPastSearches($patientId: ID!) {
    getPatientPastSearches(patientId: $patientId) {
      searchType
      typeId
      name
      image
    }
  }
`;
