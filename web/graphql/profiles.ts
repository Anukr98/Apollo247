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

export const PATIENT_SIGN_IN = gql`
  mutation PatientSignIn($jwt: String!) {
    patientSignIn(jwt: $jwt) {
      patients {
        id
        mobileNumber
        firstName
        lastName
        sex
      }
    }
  }
`;
