import gql from 'graphql-tag';

export const UPDATE_APPOINTMENT_SESSION = gql`
  mutation UpdateAppointmentSession($UpdateAppointmentSessionInput: UpdateAppointmentSessionInput) {
    updateAppointmentSession(updateAppointmentSessionInput: $UpdateAppointmentSessionInput) {
      sessionId
      appointmentToken
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

export const GET_APPOINTMENT_DATA = gql`
  query GetAppointmentData($appointmentId: String!) {
    getAppointmentData(appointmentId: $appointmentId) {
      appointmentsHistory {
        appointmentType
        id
        patientId
        appointmentDateTime
        status
        hospitalId
        doctorId
        isFollowUp
        displayId
        rescheduleCount
        appointmentState
        isJdQuestionsComplete
        isSeniorConsultStarted
        doctorInfo {
          id
          salutation
          firstName
          lastName
          displayName
          fullName
          experience
          onlineConsultationFees
          physicalConsultationFees
          specialty {
            name
          }
          qualification
          city
          photoUrl
          thumbnailUrl
          doctorType
          doctorHospital {
            facility {
              id
              name
              streetLine1
              streetLine2
              streetLine3
              city
            }
          }
        }
      }
    }
  }
`;
