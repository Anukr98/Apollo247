import gql from 'graphql-tag';

export const GET_DOCTOR_APPOINTMENTS = gql`
  query GetDoctorAppointments($doctorId: String, $startDate: Date!, $endDate: Date!) {
    getDoctorAppointments(doctorId: $doctorId, startDate: $startDate, endDate: $endDate) {
      appointmentsHistory {
        id
        displayId
        patientId
        isJdQuestionsComplete
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
          isJdConsultStarted
        }
        patientInfo {
          id
          firstName
          lastName
          mobileNumber
          photoUrl
        }
      }
      newPatientsList
    }
  }
`;
export const SUBMIT_JD_CASESHEET = gql`
  mutation SubmitJdCasesheet($appointmentId: String) {
    submitJDCaseSheet(appointmentId: $appointmentId)
  }
`;
