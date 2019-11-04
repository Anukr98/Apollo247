import gql from "graphql-tag";

export const GET_ALL_SPECIALITIES = gql`
  query GetAllSpecialties {
    getAllSpecialties {
      id
      name
      image
    }
  }
`;
