import gql from 'graphql-tag';

export const GET_CONSULT_QUEUE = gql`
  query GetConsultQueue($doctorId: String!) {
    getConsultQueue(doctorId: $doctorId) {
      consultQueue {
        order
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
