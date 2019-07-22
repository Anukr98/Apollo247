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
