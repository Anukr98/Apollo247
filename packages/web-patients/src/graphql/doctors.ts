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
      displayName
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
  query SearchDoctorAndSpecialtyByName($searchText: String!, $patientId: ID!) {
    SearchDoctorAndSpecialtyByName(searchText: $searchText, patientId: $patientId) {
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
      doctorsNextAvailability {
        doctorId
        onlineSlot
        physicalSlot
        referenceSlot
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
          displayName
          experience
          specialty {
            id
            name
          }
          specialization
          qualification
          city
          photoUrl
          thumbnailUrl
          doctorType
        }
        specialties {
          name
          id
        }
      }
      otherDoctors {
        firstName
        lastName
        experience
        id
        specialty {
          name
        }
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
      doctorsNextAvailability {
        doctorId
        onlineSlot
        physicalSlot
        referenceSlot
      }
      specialties {
        id
        name
        image
        userFriendlyNomenclature
      }
        otherDoctorsNextAvailability {
          doctorId
          onlineSlot
          physicalSlot
          referenceSlot
        }
    }
  }
`;

export const PATIENT_APPOINTMENT_HISTORY = gql`
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
        isSeniorConsultStarted
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
        isConsultStarted
        appointmentState
        isFollowUp
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
        physicalAvailableSlot
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
