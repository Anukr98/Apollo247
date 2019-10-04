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
          symptoms {
            symptom
          }
          status
          doctorType
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
