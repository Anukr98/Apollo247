import gql from 'graphql-tag';

export const GET_DOCTOR_DETAILS = gql`
  query GetDoctorDetails {
    getDoctorDetails {
      awards
      city
      country
      dateOfBirth
      doctorType
      delegateNumber
      emailAddress
      experience
      firebaseToken
      firstName
      isActive
      id
      languages
      lastName
      mobileNumber
      onlineConsultationFees
      photoUrl
      physicalConsultationFees
      qualification
      registrationNumber
      salutation
      specialization
      state
      streetLine1
      streetLine2
      streetLine3
      zip
      specialty {
        name
      }
      consultHours {
        consultMode
        consultType
        startTime
        endTime
        weekDay
      }
      packages {
        name
        fees
      }
      doctorHospital {
        facility {
          city
          country
          facilityType
          latitude
          longitude
          name
          state
          streetLine1
          streetLine2
          streetLine3
        }
      }
      starTeam {
        associatedDoctor {
          gender
          firstName
          lastName
          emailAddress
          id
          experience
          photoUrl
          mobileNumber
          salutation
          qualification
        }
      }
      bankAccount {
        bankName
        accountType
        accountNumber
        accountHolderName
        IFSCcode
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
        address
      }
      paymentDetails {
        accountNumber
        address
      }
      clinics {
        name
        image
        addressLine1
        addressLine2
        addressLine3
        city
      }
      starDoctorTeam {
        id
        salutation
        firstName
        lastName
        experience
        speciality
        specialization
        education
        services
        languages
        city
        awards
        photoUrl
        package
        inviteStatus
        address
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

export const GET_DOCTOR_APPOINTMENTS = gql`
  query GetDoctorAppointments($doctorId: String, $startDate: Date, $endDate: Date) {
    getDoctorAppointments(doctorId: $doctorId, startDate: $startDate, endDate: $endDate) {
      appointmentsHistory {
        appointmentType
        doctorId
        status
        hospitalId
        id
        patientId
        appointmentDateTime
        bookingDate
      }
    }
  }
`;

/**
 * @returns {DoctorProfile}
 * @param {String} searchString
 */
export const GET_DOCTORS_FOR_STAR_DOCTOR_PROGRAM = gql`
  query GetDoctorsForStarDoctorProgram($searchString: String!) {
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
  mutation AddDoctorToStarDoctorProgram($starDoctorId: String!, $doctorId: String!) {
    addDoctorToStarDoctorProgram(starDoctorId: $starDoctorId, doctorId: $doctorId)
  }
`;

/**
 * @returns {boolean}
 * @param {String} starDoctorId
 * @param {String} doctorId
 */
export const REMOVE_DOCTOR_FROM_STAR_DOCTOR_PROGRAM = gql`
  mutation RemoveDoctorFromStarDoctorProgram($starDoctorId: String!, $doctorId: String!) {
    removeDoctorFromStarDoctorProgram(starDoctorId: $starDoctorId, doctorId: $doctorId)
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
