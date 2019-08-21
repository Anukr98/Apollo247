import gql from 'graphql-tag';

/* get doctor details by doctor id */
export const GET_DOCTOR_DETAILS_BY_ID = gql`
  query GetDoctorDetailsById($id: String!) {
    getDoctorDetailsById(id: $id) {
      id
      salutation
      firstName
      lastName
      mobileNumber
      experience
      specialization
      languages
      city
      awards
      photoUrl
      registrationNumber
      onlineConsultationFees
      physicalConsultationFees
      qualification
      doctorType
      starTeam {
        associatedDoctor {
          firstName
          lastName
          experience
          qualification
          id
          photoUrl
          specialty {
            id
            name
            image
          }
          doctorHospital {
            facility {
              name
              facilityType
              streetLine1
              streetLine2
              streetLine3
              city
              country
              latitude
              longitude
              id
            }
          }
        }
      }
      specialty {
        id
        image
        name
      }
      zip
      doctorType
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
          id
        }
      }
      consultHours {
        consultMode
        consultType
        endTime
        id
        startTime
        weekDay
        isActive
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

export const GET_DOCTORS_BY_SPECIALITY_AND_FILTERS = gql`
  query GetDoctorsBySpecialtyAndFilters($filterInput: FilterDoctorInput) {
    getDoctorsBySpecialtyAndFilters(filterInput: $filterInput) {
      doctors {
        id
        firstName
        lastName
        specialty {
          id
          name
        }
        experience
        photoUrl
        qualification
        consultHours {
          consultMode
          consultType
          id
          isActive
          startTime
          weekDay
          endTime
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
            id
          }
        }
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
        experience
        photoUrl
        qualification
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
            id
          }
        }
      }
      specialties {
        name
        id
      }
      possibleMatches {
        doctors {
          id
          firstName
          lastName
          specialty {
            id
            name
          }
          experience
          photoUrl
          qualification
        }
        specialties {
          name
          id
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
          streetLine1
          streetLine2
          streetLine3
          specialty {
            name
            id
          }
        }
      }
    }
  }
`;

export const GET_DOCTOR_NEXT_AVAILABILITY = gql`
  query GetDoctorNextAvailableSlot($DoctorNextAvailableSlotInput: DoctorNextAvailableSlotInput) {
    getDoctorNextAvailableSlot(DoctorNextAvailableSlotInput: $DoctorNextAvailableSlotInput) {
      doctorAvailalbeSlots {
        doctorId
        availableSlot
      }
    }
  }
`;

export const GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS = gql`
  query GetDoctorPhysicalAvailableSlots(
    $DoctorPhysicalAvailabilityInput: DoctorPhysicalAvailabilityInput
  ) {
    getDoctorPhysicalAvailableSlots(
      DoctorPhysicalAvailabilityInput: $DoctorPhysicalAvailabilityInput
    ) {
      availableSlots
    }
  }
`;
