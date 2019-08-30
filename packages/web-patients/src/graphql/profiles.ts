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
        gender
        uhid
        dateOfBirth
      }
    }
  }
`;

export const GET_CURRENT_PATIENTS = gql`
  query GetCurrentPatients {
    getCurrentPatients {
      patients {
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
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($patientInput: UpdatePatientInput!) {
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
    }
  }
`;

export const GET_PATIENT_ADDRESS_LIST = gql`
  query GetPatientAddressListQuery($patientId: String!) {
    getPatientAddressList(patientId: $patientId) {
      addressList {
        addressLine1
        addressLine2
        zipcode
      }
    }
  }
`;
