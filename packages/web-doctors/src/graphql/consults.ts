import gql from 'graphql-tag';

export const GET_CONSULT_QUEUE = gql`
  query GetConsultQueue($doctorId: String!) {
    getConsultQueue(doctorId: $doctorId) {
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
