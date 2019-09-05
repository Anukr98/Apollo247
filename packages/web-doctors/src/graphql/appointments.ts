import gql from 'graphql-tag';

export const GET_DOCTOR_APPOINTMENTS = gql`
  query GetDoctorAppointments($startDate: Date!, $endDate: Date!) {
    getDoctorAppointments(startDate: $startDate, endDate: $endDate) {
      appointmentsHistory {
        id
        patientId
        appointmentDateTime
        status
        bookingDate
        appointmentType
        caseSheet {
          diagnosis {
            name
          }
        }
        patientInfo {
          id
          firstName
          lastName
        }
      }
      newPatientsList
    }
  }
`;
