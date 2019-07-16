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

export const IS_DOCTOR = gql`
  query hasAccess($mobileNumber: String!) {
    hasAccess(mobileNumber: $mobileNumber)
  }
`;

export const GET_DOCTOR_PROFILE = gql`
  query getDoctorProfile($mobileNumber: String!) {
    getDoctorProfile(mobileNumber: $mobileNumber) {
      id
      firstName
      lastName
      mobileNumber
      experience
      speciality
      isStarDoctor
      education
      services
      languages
      city
      awards
      clinicsList {
        name
        location
      }
      starDoctorTeam {
        firstName
        lastName
        experience
        typeOfConsult
        inviteStatus
      }
    }
  }
`;

export const PATIENT_SIGN_IN = gql`
  mutation PatientSignIn($jwt: String!) {
    patientSignIn(jwt: $jwt) {
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
