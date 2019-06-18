import gql from 'graphql-tag';

export const GET_DOCTORS = gql`
  query GetDoctors {
    doctors {
      id
      firstName
      lastName
      email
    }
  }
`;
