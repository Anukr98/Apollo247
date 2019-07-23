import gql from 'graphql-tag';

export const getPatientTypeDefs = gql`
  type GetPatientsResult {
    patients: [Patient!]!
  }
  extend type Query {
    getPatients: GetPatientsResult
  }
`;

const getPatients = () => {
  return { patients: [] };
};

export const getPatientResolvers = {
  Query: {
    getPatients,
  },
};
