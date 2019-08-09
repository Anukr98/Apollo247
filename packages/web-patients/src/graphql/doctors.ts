import gql from 'graphql-tag';

export const GET_DOCTOR_DETAILS_BY_ID = gql`
  query GetDoctorProfileById($id: String!) {
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
        inviteStatus
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

export const SEARCH_DOCTORS_AND_SPECIALITY = gql`
  query SearchDoctorAndSpecialty($searchText: String!) {
    SearchDoctorAndSpecialty(searchText: $searchText) {
      doctors {
        id
        firstName
        lastName
        speciality
        experience
        education
        availableForPhysicalConsultation
        availableForVirtualConsultation
        photoUrl
        city
      }
      specialties {
        name
        image
      }
    }
  }
`;

export const SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME = gql`
  query SearchDoctorAndSpecialtyByName($searchText: String!) {
    SearchDoctorAndSpecialtyByName(searchText: $searchText) {
      doctors {
        id
        firstName
        lastName
        specialty {
          id
          name
        }
      }
      specialties {
        name
      }
      possibleMatches {
        doctors {
          firstName
        }
        specialties {
          name
        }
      }
      otherDoctors {
        firstName
        specialty {
          name
        }
      }
    }
  }
`;

export const DOCTORS_BY_SPECIALITY = gql`
  query GetSpecialtyDoctorsWithFilters($filterInput: filterInput) {
    getSpecialtyDoctorsWithFilters(filterInput: $filterInput) {
      doctors {
        id
        firstName
        lastName
        speciality
        availableForPhysicalConsultation
        availableForVirtualConsultation
        education
        city
        photoUrl
        experience
      }
    }
  }
`;

export const PATIENT_APPOINTMENT_HISTORY = gql`
  query AppointmentHistory($appointmentHistoryInput: AppointmentHistoryInput) {
    getAppointmentHistory(appointmentHistoryInput: $appointmentHistoryInput) {
      appointmentsHistory {
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

export const GET_DOCTOR_AVAILABLE_SLOTS = gql`
  query GetDoctorAvailableSlots($DoctorAvailabilityInput: DoctorAvailabilityInput) {
    getDoctorAvailableSlots(DoctorAvailabilityInput: $DoctorAvailabilityInput) {
      availableSlots
    }
  }
`;

export const BOOK_APPOINTMENT = gql`
  mutation BookAppointment($bookAppointment: BookAppointmentInput!) {
    bookAppointment(appointmentInput: $bookAppointment) {
      appointment {
        id
        doctorId
        appointmentDateTime
        status
        appointmentType
        patientId
      }
    }
  }
`;

export const GET_PATIENT_APPOINTMENTS = gql`
  query GetPatientAppointments($patientAppointmentsInput: PatientAppointmentsInput) {
    getPatinetAppointments(patientAppointmentsInput: $patientAppointmentsInput) {
      patinetAppointments {
        id
        patientId
        doctorId
        appointmentDateTime
        appointmentType
        hospitalId
        status
        bookingDate
        doctorInfo {
          id
          firstName
          lastName
          doctorType
          experience
          isActive
          photoUrl
          qualification
          specialization
        }
      }
    }
  }
`;
