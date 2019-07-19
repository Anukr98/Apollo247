import gql from 'graphql-tag';

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
        image
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

/**
 * @returns {DoctorProfile}
 * @param {String} searchString
 */
export const GET_DOCTORS_FOR_STAR_DOCTOR_PROGRAM = gql`
  query getDoctorsForStarDoctorProgram {
    getDoctorsForStarDoctorProgram(searchString: $searchString) {
      profile {
        id
        firstName
        lastName
      }
    }
  }
`;

/**
 * @returns {boolean}
 * @param {String} starDoctorId
 * @param {String} doctorId
 */
export const ADD_DOCTOR_TO_STAR_DOCTOR_PROGRAM = gql`
  query addDoctorToStartDoctorProgram {
    addDoctorToStartDoctorProgram(starDoctorId: $starDoctorId, doctorId: $doctorId)
  }
`;

/**
 * @returns {boolean}
 * @param {String} starDoctorId
 * @param {String} doctorId
 */
export const REMOVE_DOCTOR_FROM_STAR_DOCTOR_PROGRAM = gql`
  query removeDoctorFromStartDoctorProgram {
    removeDoctorFromStartDoctorProgram(starDoctorId: $starDoctorId, doctorId: $doctorId)
  }
`;

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
