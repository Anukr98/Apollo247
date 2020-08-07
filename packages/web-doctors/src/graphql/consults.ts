import gql from 'graphql-tag';

export const GET_CONSULT_QUEUE = gql`
  query GetConsultQueue($doctorId: String!, $isActive: Boolean) {
    getConsultQueue(doctorId: $doctorId, isActive: $isActive) {
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
          status
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

export const UPDATE_PATIENT_ALLERGIES = gql`
  mutation UpdatePatientAllergies($patientId: String!, $allergies: String!) {
    updatePatientAllergies(patientId: $patientId, allergies: $allergies) {
      patient {
        id
        allergies
      }
    }
  }
`;

export const UPLOAD_CHAT_DOCUMENT = gql`
  mutation UploadChatDocument($fileType: String, $base64FileInput: String, $appointmentId: String) {
    uploadChatDocument(
      fileType: $fileType
      base64FileInput: $base64FileInput
      appointmentId: $appointmentId
    ) {
      filePath
    }
  }
`;

export const SEND_CALL_NOTIFICATION = gql`
  query SendCallNotification(
    $appointmentId: String
    $callType: APPT_CALL_TYPE
    $doctorType: DOCTOR_CALL_TYPE
    $deviceType: DEVICETYPE
    $callSource: BOOKINGSOURCE
  ) {
    sendCallNotification(
      appointmentId: $appointmentId
      callType: $callType
      doctorType: $doctorType
      deviceType: $deviceType
      callSource: $callSource
    ) {
      status
      callDetails {
        id
      }
    }
  }
`;

export const END_CALL_NOTIFICATION = gql`
  query EndCallNotification($appointmentCallId: String) {
    endCallNotification(appointmentCallId: $appointmentCallId) {
      status
    }
  }
`;

export const INITIATE_CONFERENCE_TELEPHONE_CALL = gql`
  query InitateConferenceTelephoneCall($exotelInput: exotelInput) {
    initateConferenceTelephoneCall(exotelInput: $exotelInput) {
      response
      isError
    }
  }
`;
