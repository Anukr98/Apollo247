import gql from 'graphql-tag';

export const GET_DOCTOR_APPOINTMENTS = gql`
  query GetDoctorAppointments($doctorId: String!, $startDate: Date!, $endDate: Date!) {
    getDoctorAppointments(doctorId: $doctorId, startDate: $startDate, endDate: $endDate) {
      appointmentsHistory {
        id
        patientId
        appointmentDateTime
        status
        appointmentType
      }
    }
  }
`;
