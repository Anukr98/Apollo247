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

export const GET_CURRENT_PATIENTS = gql`
  query GetCurrentPatients {
    getCurrentPatients {
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

export const BOOK_APPOINTMENT = gql`
  mutation bookAppointment($bookAppointment: BookAppointmentInput!){
  bookAppointment(appointmentInput:$bookAppointment){
    appointment{
      id
      doctorId
      appointmentDateTime
      status
      appointmentType
      patientId
    }
  }
}`;

export const GET_SPECIALTIES = gql`
  query getSpecialties {
    getSpecialties {
      id
      name
      image
    }
  }
`;

export const GET_DOCTOR_PROFILE_BY_ID = gql`
  query getDoctorProfileById($id: String!) {
    getDoctorProfileById(id: $id) {
      profile {
        id
        salutation
        firstName
        lastName
        experience
        speciality
        specialization
        isStarDoctor
        education
        services
        languages
        city
        address
        awards
        photoUrl
        registrationNumber
        isProfileComplete
        availableForPhysicalConsultation
        availableForVirtualConsultation
        onlineConsultationFees
        physicalConsultationFees
        availableIn
      }
      paymentDetails {
        accountNumber
        address
      }
      clinics {
        id
        name
        image
        addressLine1
        addressLine2
        addressLine3
        city
        isClinic
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
        city
        address
        photoUrl
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

export const SEARCH_DOCTOR_AND_SPECIALITY = gql`
  query SearchDoctorAndSpecialty($searchText: String!) {
    SearchDoctorAndSpecialty(searchText: $searchText) {
      doctors {
        id
        salutation
        firstName
        lastName
        experience
        speciality
        specialization
        isStarDoctor
        education
        services
        languages
        city
        address
        photoUrl
        availableIn
        availableForPhysicalConsultation
        availableForVirtualConsultation
        isStarDoctor
        services
        languages
        availableIn
      }
      specialties {
        id
        name
        image
      }
      possibleMatches {
        doctors {
          id
          salutation
          firstName
          lastName
          experience
          speciality
          specialization
          isStarDoctor
          education
          services
          languages
          city
          address
          photoUrl
          availableIn
        }
        specialties {
          id
          name
          image
        }
      }
    }
  }
`;

export const SPECIALITY_DOCTOR_FILTERS = gql`
  query getSpecialtyDoctorsWithFilters($filterInput: filterInput) {
    getSpecialtyDoctorsWithFilters(filterInput: $filterInput) {
      doctors {
        id
        salutation
        firstName
        lastName
        experience
        speciality
        specialization
        isStarDoctor
        education
        services
        languages
        city
        address
        photoUrl
        availableForPhysicalConsultation
        availableForVirtualConsultation
        availableIn
      }
    }
  }
`;

export const GET_PAST_SEARCHES = gql`
  query getPastSearches {
    getPastSearches {
      searchType
      typeId
      name
      image
    }
  }
`;

export const GET_APPOINTMENT_HISTORY = gql`
  query getAppointmentHistory($appointmentHistoryInput: AppointmentHistoryInput) {
    getAppointmentHistory(appointmentHistoryInput: $appointmentHistoryInput) {
      appointmentsHistory {
        id
        patientId
        doctorId
        appointmentDateTime
        appointmentType
        hospitalId
        status
        bookingDate
      }
    }
  }
`;

export const GET_AVAILABLE_SLOTS = gql`
  query getDoctorAvailableSlots($DoctorAvailabilityInput: DoctorAvailabilityInput!) {
    getDoctorAvailableSlots(DoctorAvailabilityInput: $DoctorAvailabilityInput) {
      availableSlots
    }
  }
`;
