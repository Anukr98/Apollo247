import gql from 'graphql-tag';

export const GET_PATIENTS = gql`
  query GetPatients {
    getPatients {
      patients {
        id
        mobileNumber
        firstName
        lastName
        gender
        uhid
        relation
      }
    }
  }
`;

export const PATIENT_SIGN_IN = gql`
  mutation PatientSignIn($jwt: String!) {
    patientSignIn(jwt: $jwt) {
      patients {
        id
        firstName
        lastName
        uhid
        gender
        mobileNumber
        relation
      }
      errors {
        messages
      }
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation updatePatient($patientInput: UpdatePatientInput!) {
    updatePatient(patientInput: $patientInput) {
      patient {
        id
        mobileNumber
        firstName
        lastName
        relation
        gender
        uhid
        dateOfBirth
        emailAddress
      }
      errors {
        messages
      }
    }
  }
`;
