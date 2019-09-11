import gql from 'graphql-tag';

export const GET_CONSULT_QUEUE = gql`
  query GetConsultQueueAndAllDoctorAppointments($doctorId: String!) {
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
    getAllDoctorAppointments(doctorId: $doctorId) {
      appointmentsAndPatients {
        appointment {
          id
          appointmentType
          appointmentDateTime
        }
        patient {
          id
          uhid
          firstName
          lastName
          photoUrl
        }
      }
    }
  }
`;
