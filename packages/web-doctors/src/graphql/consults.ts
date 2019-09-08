import gql from 'graphql-tag';

export const GET_DOCTOR_CONSULTS = gql`
  query GetDoctorConsults($getDoctorConsultsInput: GetDoctorConsultsInput!) {
    getDoctorConsults(getDoctorConsultsInput: $getDooctorConsultsInput) {
      doctorConsults {
        patient {
          id
          uhid
          firstName
          lastName
          photoUrl
        }
        appointment {
          appointmentDateTime
        }
      }
    }
  }
`;
