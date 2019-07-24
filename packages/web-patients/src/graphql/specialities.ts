import gql from 'graphql-tag';

export const GET_SPECIALITIES = gql`
  query GetSpecialties {
    getSpecialties {
      id
      name
      image
    }
  }
`;
