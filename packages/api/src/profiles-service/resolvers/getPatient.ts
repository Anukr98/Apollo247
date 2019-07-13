import gql from 'graphql-tag';
import { Resolver } from 'profiles-service/profiles-service';
import { Patient, ErrorMsgs } from 'profiles-service/entity/patient';

export const getPatientTypeDefs = gql`
  type GetPatientsResult {
    patients: [Patient!]!
  }
  extend type Query {
    getPatients: GetPatientsResult
  }
`;


const getPatients = () => ({ patients: [] });

export const getPatientResolvers = {
  Query: {
    getPatients,
  }
};
