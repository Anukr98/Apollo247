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

export const GET_ALL_SPECIALITIES = gql`
  query GetAllSpecialties {
    getAllSpecialties {
      id
      name
      image
    }
  }
`;
