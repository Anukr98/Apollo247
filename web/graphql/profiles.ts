import gql from 'graphql-tag';

export const GET_PATIENTS = gql`
  query GetPatients {
    getPatients {
      patients {
        id
        mobileNumber
        firstName
        lastName
        relation
        sex
        uhid
        dateOfBirth
      }
    }
  }
`;

export const PATIENT_SIGN_IN = gql`
  mutation PatientSignIn($jwt: String!) {
    patientSignIn(jwt: $jwt) {
      patients {
        id
        mobileNumber
        firstName
        lastName
        relation
        sex
        uhid
        dateOfBirth
      }
    }
  }
`;
