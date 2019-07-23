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

// export const IS_DOCTOR = gql`
//   query hasAccess($mobileNumber: String!) {
//     hasAccess(mobileNumber: $mobileNumber)
//   }
// `;
export const GET_DOCTOR_PROFILE = gql`
  query getDoctorProfile {
    getDoctorProfile {
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
        emailAddress
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
