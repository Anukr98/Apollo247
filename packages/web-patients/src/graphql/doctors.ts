import gql from 'graphql-tag';

/* get doctor details by doctor id */
export const GET_DOCTOR_DETAILS_BY_ID = gql`
  query GetDoctorDetailsById($id: String!) {
    getDoctorDetailsById(id: $id) {
      id
      salutation
      firstName
      lastName
      fullName
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
      chatDays
      starTeam {
        associatedDoctor {
          fullName
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
              imageUrl
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
          imageUrl
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
        actualDay
      }
    }
  }
`;

export const GET_SECRETARY_DETAILS_BY_DOCTOR_ID = gql`
  query getSecretaryDetailsByDoctorId($doctorId: String!) {
    getSecretaryDetailsByDoctorId(doctorId: $doctorId) {
      id
      name
      mobileNumber
      isActive
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
        fullName
        specialty {
          id
          name
          userFriendlyNomenclature
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
        onlineConsultationFees
        physicalConsultationFees
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
            imageUrl
          }
        }
      }
      specialty {
        specialistSingularTerm
        specialistPluralTerm
      }
      doctorsNextAvailability {
        doctorId
        onlineSlot
        physicalSlot
        referenceSlot
        currentDateTime
        availableInMinutes
      }
      doctorsAvailability {
        doctorId
        availableModes
      }
      apolloDoctorCount
      partnerDoctorCount
    }
  }
`;

export const GET_DOCTOR_LIST = gql`
  query GetDoctorList($filterInput: FilterDoctorInput) {
    getDoctorList(filterInput: $filterInput) {
      doctors
      specialties {
        id
        name
        specialtydisplayName
      }
      apolloDoctorCount
      partnerDoctorCount
    }
  }
`;

export const SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME = gql`
  query SearchDoctorAndSpecialtyByName(
    $searchText: String!
    $patientId: ID!
    $pincode: String
    $city: String!
    $geoLocation: Geolocation
  ) {
    SearchDoctorAndSpecialtyByName(
      searchText: $searchText
      patientId: $patientId
      pincode: $pincode
      city: $city
      geolocation: $geoLocation
    ) {
      doctors {
        id
        firstName
        lastName
        fullName
        specialty {
          id
          name
          userFriendlyNomenclature
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
        onlineConsultationFees
        physicalConsultationFees
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
            imageUrl
          }
        }
      }
      doctorsNextAvailability {
        doctorId
        onlineSlot
        physicalSlot
        referenceSlot
        availableInMinutes
      }
      specialties {
        name
        id
        userFriendlyNomenclature
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
            userFriendlyNomenclature
          }
          specialization
          qualification
          city
          photoUrl
          thumbnailUrl
          doctorType
        }
        doctorsNextAvailability {
          doctorId
          onlineSlot
          physicalSlot
          referenceSlot
          currentDateTime
          availableInMinutes
        }
        specialties {
          name
          id
          userFriendlyNomenclature
        }
      }
      otherDoctors {
        firstName
        lastName
        experience
        id
        specialty {
          name
          userFriendlyNomenclature
        }
        photoUrl
        thumbnailUrl
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
        caseSheet {
          symptoms {
            symptom
            since
            howOften
            severity
          }
        }
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
        appointmentPayments {
          id
          amountPaid
          paymentRefId
          paymentStatus
          paymentDateTime
          responseCode
          responseMessage
          bankTxnId
          orderId
        }
        id
        patientId
        doctorId
        appointmentDateTime
        appointmentType
        hospitalId
        status
        bookingDate
        rescheduleCount
        isConsultStarted
        appointmentState
        isFollowUp
        displayId
        isConsultStarted
        isJdQuestionsComplete
        isSeniorConsultStarted
        symptoms
        paymentOrderId
        couponCode
        actualAmount
        discountedAmount
        doctorInfo {
          id
          firstName
          lastName
          fullName
          displayName
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
            specialistSingularTerm
            specialistPluralTerm
            userFriendlyNomenclature
          }
          doctorHospital {
            facility {
              city
              country
              facilityType
              id
              imageUrl
              name
              state
              streetLine1
              streetLine2
              streetLine3
              zipcode
              latitude
              longitude
            }
          }
          consultHours {
            consultMode
            consultType
            endTime
            facility {
              city
              country
              facilityType
              id
              imageUrl
              latitude
              longitude
              name
              state
              streetLine1
              streetLine2
              streetLine3
              zipcode
            }
            id
            isActive
            startTime
            weekDay
            consultDuration
            consultBuffer
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

export const GET_PATIENT_ALL_APPOINTMENTS = gql`
  query GetPatientAllAppointments($patientId: String!) {
    getPatientAllAppointments(patientId: $patientId) {
      appointments {
        id
        patientId
        doctorId
        appointmentDateTime
        appointmentType
        hospitalId
        status
        bookingDate
        rescheduleCount
        isFollowUp
        appointmentState
        displayId
        isConsultStarted
        isSeniorConsultStarted
        isJdQuestionsComplete
        symptoms
        caseSheet {
          followUpAfterInDays
          doctorType
        }
        doctorInfo {
          awards
          city
          country
          dateOfBirth
          displayName
          doctorType
          delegateNumber
          emailAddress
          experience
          firebaseToken
          firstName
          fullName
          gender
          isActive
          id
          languages
          lastName
          mobileNumber
          onlineConsultationFees
          onlineStatus
          photoUrl
          physicalConsultationFees
          qualification
          registrationNumber
          salutation
          signature
          specialization
          state
          streetLine1
          streetLine2
          streetLine3
          thumbnailUrl
          zip
          bankAccount {
            accountHolderName
            accountNumber
            accountType
            bankName
            city
            id
            IFSCcode
            state
            streetLine1
          }
          consultHours {
            consultMode
            consultType
            endTime
            facility {
              city
              country
              facilityType
              id
              imageUrl
              latitude
              longitude
              name
              state
              streetLine1
              streetLine2
              streetLine3
              zipcode
            }
            id
            isActive
            startTime
            weekDay
            consultDuration
            consultBuffer
            actualDay
          }
          doctorHospital {
            facility {
              city
              country
              facilityType
              id
              imageUrl
              latitude
              longitude
              name
              state
              streetLine1
              streetLine2
              streetLine3
              zipcode
            }
          }
          doctorSecretary {
            secretary {
              id
              name
              mobileNumber
              isActive
            }
          }
          packages {
            fees
            id
            name
          }
          specialty {
            createdDate
            id
            image
            name
            specialistSingularTerm
            specialistPluralTerm
            userFriendlyNomenclature
            displayOrder
          }
          starTeam {
            isActive
            associatedDoctor {
              fullName
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
                  imageUrl
                }
              }
            }
          }
        }
      }
    }
  }
`;
