import gql from 'graphql-tag';

export const GET_DOCTOR_CONSULTS = gql`
  query GetDoctorConsults {
    getDoctorConsults {
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
