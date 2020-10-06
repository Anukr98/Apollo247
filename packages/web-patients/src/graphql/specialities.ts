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
      slugName
      symptoms
      commonSearchWords
      shortDescription
    }
  }
`;

export const GET_ALL_CITIES = gql`
  query getAllCities {
    getAllCities {
      city
    }
  }
`;
