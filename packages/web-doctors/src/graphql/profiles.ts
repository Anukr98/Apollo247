import gql from 'graphql-tag';

export const GET_PATIENTS = gql`
  query GetPatients {
    getPatients {
      patients {
        id
        mobileNumber
        firstName
        lastName
        relation
        gender
        uhid
        dateOfBirth
        emailAddress
      }
    }
  }
`;
export const GET_DOCTOR_PROFILE = gql`
  query GetDoctorProfile {
    getDoctorProfile {
      profile {
        id
        salutation
        firstName
        lastName
        mobileNumber
        experience
        speciality
        specialization
        isStarDoctor
        education
        services
        languages
        city
        awards
        photoUrl
        registrationNumber
        isProfileComplete
        availableForPhysicalConsultation
        availableForVirtualConsultation
        onlineConsultationFees
        physicalConsultationFees
        package
        inviteStatus
      }
      paymentDetails {
        accountNumber
        address
      }
      clinics {
        name
        addressLine1
        addressLine2
        addressLine3
        city
      }
      starDoctorTeam {
        firstName
        lastName
        experience
        inviteStatus
      }
      consultationHours {
        days
        startTime
        endTime
        availableForPhysicalConsultation
        availableForVirtualConsultation
        type
      }
    }
  }
`;
export const REMOVE_STAR_DOCTOR = gql`
  mutation RemoveDoctorFromStarDoctorProgram($starDoctorId: String!, $doctorId: String!) {
    removeDoctorFromStarDoctorProgram(starDoctorId: $starDoctorId, doctorId: $doctorId)
  }
`;
export const GET_DOCTOR_FOR_STAR_DOCTOR_PROGRAM = gql`
  query getDoctorsForStarDoctorProgram($searchString: String!) {
    getDoctorsForStarDoctorProgram(searchString: $searchString) {
      profile {
        id
        firstName
        lastName
        inviteStatus
        typeOfConsult
        experience
      }
      starDoctorTeam {
        id
        firstName
        lastName
        inviteStatus
        typeOfConsult
        experience
      }
    }
  }
`;
export const ADD_DOCTOR_TO_STAR_PROGRAM = gql`
  mutation addDoctorToStartDoctorProgram($starDoctorId: String!, $doctorId: String!) {
    addDoctorToStartDoctorProgram(starDoctorId: $starDoctorId, doctorId: $doctorId)
  }
`;

export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($patientInput: UpdatePatientInput!) {
    updatePatient(patientInput: $patientInput) {
      patient {
        id
        mobileNumber
        firstName
        lastName
        relation
        gender
        uhid
        dateOfBirth
        emailAddress
      }
    }
  }
`;
