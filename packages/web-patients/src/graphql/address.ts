import gql from 'graphql-tag';

export const GET_PATIENT_ADDRESSES_LIST = gql`
  query GetPatientAddressList($patientId: String!) {
    getPatientAddressList(patientId: $patientId) {
      addressList {
        id
        addressLine1
        addressLine2
        city
        mobileNumber
        state
        zipcode
        landmark
        createdDate
        updatedDate
        addressType
        otherAddressType
        latitude
        longitude
        stateCode
      }
    }
  }
`;

export const SAVE_PATIENT_ADDRESS = gql`
  mutation SavePatientAddress($patientAddress: PatientAddressInput) {
    savePatientAddress(PatientAddressInput: $patientAddress) {
      patientAddress {
        id
        addressLine1
        addressLine2
        city
        mobileNumber
        state
        zipcode
        landmark
        createdDate
        addressType
        otherAddressType
        latitude
        longitude
        stateCode
      }
    }
  }
`;

export const UPDATE_PATIENT_ADDRESS = gql`
  mutation UpdatePatientAddress($UpdatePatientAddressInput: UpdatePatientAddressInput!) {
    updatePatientAddress(UpdatePatientAddressInput: $UpdatePatientAddressInput) {
      patientAddress {
        id
        addressLine1
        addressLine2
        city
        mobileNumber
        state
        zipcode
        landmark
        createdDate
        updatedDate
        addressType
        otherAddressType
        latitude
        longitude
        stateCode
      }
    }
  }
`;

export const DELETE_PATIENT_ADDRESS = gql`
  mutation deletePatientAddress($id: String) {
    deletePatientAddress(id: $id) {
      status
    }
  }
`;
