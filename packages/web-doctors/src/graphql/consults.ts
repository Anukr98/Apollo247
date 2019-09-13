import gql from 'graphql-tag';

export const GET_CONSULT_QUEUE = gql`
  query GetConsultQueue($doctorId: String!) {
    getConsultQueue(doctorId: $doctorId) {
      consultQueue {
        id
        isActive
        patient {
          id
          uhid
          firstName
          lastName
          photoUrl
        }
        appointment {
          id
          appointmentType
          appointmentDateTime
        }
      }
    }
  }
`;

export const ADD_TO_CONSULT_QUEUE = gql`
  mutation AddToConsultQueue($appointmentId: String!) {
    addToConsultQueue(appointmentId: $appointmentId) {
      id
      doctorId
    }
  }
`;

export const REMOVE_FROM_CONSULT_QUEUE = gql`
  mutation RemoveFromConsultQueue($id: Int!) {
    removeFromConsultQueue(id: $id) {
      consultQueue {
        id
        isActive
        patient {
          id
          uhid
          firstName
          lastName
          photoUrl
        }
        appointment {
          id
          appointmentType
          appointmentDateTime
        }
      }
    }
  }
`;

export const SAVE_PATIENT_FAMILY_HISTORY = gql`
  mutation SavePatientFamilyHistory($patientFamilyHistoryInput: PatientFamilyHistoryInput) {
    savePatientFamilyHistory(patientFamilyHistoryInput: $patientFamilyHistoryInput) {
      patientFamilyHistory {
        id
        description
      }
    }
  }
`;

export const GET_PATIENT_FAMILY_HISTORY = gql`
  query GetPatientFamilyHistoryList($patientId: String!) {
    getPatientFamilyHistoryList(patientId: $patientId) {
      familyHistoryList {
        id
        description
      }
    }
  }
`;

export const SAVE_PATIENT_LIFE_STYLE = gql`
  mutation SavePatientLifeStyle($patientLifeStyleInput: PatientLifeStyleInput) {
    savePatientLifeStyle(patientLifeStyleInput: $patientLifeStyleInput) {
      patientLifeStyle {
        id
        description
      }
    }
  }
`;

export const GET_PATIENT_LIFE_STYLE = gql`
  query GetPatientLifeStyleList($patientId: String) {
    getPatientLifeStyleList(patientId: $patientId) {
      lifeStyleList {
        id
        description
      }
    }
  }
`;
