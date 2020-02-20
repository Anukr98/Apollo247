import gql from 'graphql-tag';

export const GET_ALL_SPECIALITIES = gql`
  query GetAllSpecialties {
    getAllSpecialties {
      id
      name
      image
      specialistSingularTerm
      specialistPluralTerm
      userFriendlyNomenclature
      displayOrder
    }
  }
`;
