import gql from 'graphql-tag';

export const UPDATE_APPOINTMENT_SESSION = gql`
  mutation UpdateAppointmentSession($UpdateAppointmentSessionInput: UpdateAppointmentSessionInput) {
    updateAppointmentSession(updateAppointmentSessionInput: $UpdateAppointmentSessionInput) {
      sessionId
      appointmentToken
    }
  }
`;
