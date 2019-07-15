import gql from 'graphql-tag';
import { Resolver } from 'profiles-service/profiles-service';
import { Patient } from 'profiles-service/entity/patient';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';

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
