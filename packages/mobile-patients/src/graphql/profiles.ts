import gql from 'graphql-tag';

export const GET_PATIENTS = gql`
  query GetPatients {
    getPatients {
      patients {
        id
        mobileNumber
        firstName
        lastName
        gender
        uhid
        relation
      }
    }
  }
`;

export const PATIENT_SIGN_IN = gql`
  mutation PatientSignIn {
    patientSignIn {
      patients {
        id
        mobileNumber
        firstName
        lastName
        relation
        gender
        uhid
        dateOfBirth
      }
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation updatePatient($patientInput: UpdatePatientInput!) {
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

export const GET_SPECIALTIES = gql`
  query getSpecialties {
    getSpecialties {
      id
      name
    }
  }
`;

export const GET_DOCTOR_PROFILE_BY_ID = gql`
  query getDoctorProfileById($id: String!) {
    getDoctorProfileById(id: $id) {
      profile {
        id
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
        typeOfConsult
        inviteStatus
      }
      paymentDetails {
        accountNumber
        address
      }
      clinics {
        name
        location
      }
      starDoctorTeam {
        id
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
        typeOfConsult
        inviteStatus
      }
      consultationHours {
        days
        timings
        availableForPhysicalConsultation
        availableForVirtualConsultation
        type
      }
    }
  }
`;
