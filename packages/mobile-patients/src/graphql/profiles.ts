import gql from 'graphql-tag';

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
  mutation bookAppointment($bookAppointment: BookAppointmentInput!) {
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

export const SAVE_SEARCH = gql`
  mutation saveSearch($saveSearchInput: SaveSearchInput!) {
    saveSearch(saveSearchInput: $saveSearchInput) {
      saveStatus
    }
  }
`;

export const GET_PATIENT_PAST_SEARCHES = gql`
  query getPatientPastSearches($patientId: ID!) {
    getPatientPastSearches(patientId: $patientId) {
      searchType
      typeId
      name
      image
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

export const GET_PATIENT_APPOINTMENTS = gql`
  query getPatinetAppointments($patientAppointmentsInput: PatientAppointmentsInput!) {
    getPatinetAppointments(patientAppointmentsInput: $patientAppointmentsInput) {
      patinetAppointments {
        appointmentType
        id
        patientId
        appointmentDateTime
        status
        hospitalId
        doctorId
        doctorInfo {
          id
          salutation
          firstName
          lastName
          experience
          specialty {
            name
          }
          specialization
          qualification
          city
          photoUrl
          doctorType
          doctorHospital {
            facility {
              id
              name
              streetLine1
              streetLine2
              streetLine3
              city
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME = gql`
  query SearchDoctorAndSpecialtyByName($searchText: String!) {
    SearchDoctorAndSpecialtyByName(searchText: $searchText) {
      doctors {
        id
        salutation
        firstName
        lastName
        experience
        specialty {
          name
        }
        specialization
        qualification
        city
        photoUrl
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
          specialty {
            name
          }
          specialization
          qualification
          city
          photoUrl
        }
        specialties {
          id
          name
          image
        }
      }
      otherDoctors {
        id
        salutation
        firstName
        lastName
        experience
        specialty {
          name
        }
        specialization
        qualification
        city
        photoUrl
      }
    }
  }
`;

export const GET_ALL_SPECIALTIES = gql`
  query getAllSpecialties {
    getAllSpecialties {
      id
      name
      image
    }
  }
`;

export const GET_DOCTOR_DETAILS_BY_ID = gql`
  query getDoctorDetailsById($id: String!) {
    getDoctorDetailsById(id: $id) {
      id
      salutation
      firstName
      lastName
      doctorType
      qualification
      mobileNumber
      experience
      specialization
      languages
      city
      awards
      photoUrl
      specialty {
        name
      }
      registrationNumber
      onlineConsultationFees
      physicalConsultationFees
      doctorHospital {
        facility {
          id
          name
          city
          latitude
          longitude
          facilityType
          streetLine1
          streetLine2
          streetLine3
        }
      }
      starTeam {
        associatedDoctor {
          id
          salutation
          firstName
          lastName
          experience
          city
          photoUrl
          qualification
          specialty {
            name
            image
          }
        }
        isActive
      }
      consultHours {
        consultMode
        endTime
        startTime
        weekDay
        isActive
        id
        facility {
          id
        }
      }
    }
  }
`;

export const DOCTOR_SPECIALITY_BY_FILTERS = gql`
  query getDoctorsBySpecialtyAndFilters($filterInput: FilterDoctorInput) {
    getDoctorsBySpecialtyAndFilters(filterInput: $filterInput) {
      doctors {
        id
        salutation
        firstName
        lastName
        experience
        city
        photoUrl
        qualification
        specialty {
          name
          image
        }
        onlineConsultationFees
        languages
        consultHours {
          consultMode
        }
      }
      doctorsAvailability {
        doctorId
        availableModes
      }
    }
  }
`;

export const UPDATE_APPOINTMENT_SESSION = gql`
  mutation updateAppointmentSession($UpdateAppointmentSessionInput: UpdateAppointmentSessionInput) {
    updateAppointmentSession(updateAppointmentSessionInput: $UpdateAppointmentSessionInput) {
      sessionId
      appointmentToken
    }
  }
`;

export const NEXT_AVAILABLE_SLOT = gql`
  query GetDoctorNextAvailableSlot($DoctorNextAvailableSlotInput: DoctorNextAvailableSlotInput!) {
    getDoctorNextAvailableSlot(DoctorNextAvailableSlotInput: $DoctorNextAvailableSlotInput) {
      doctorAvailalbeSlots {
        availableSlot
        doctorId
      }
    }
  }
`;

export const GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS = gql`
  query getDoctorPhysicalAvailableSlots(
    $DoctorPhysicalAvailabilityInput: DoctorPhysicalAvailabilityInput!
  ) {
    getDoctorPhysicalAvailableSlots(
      DoctorPhysicalAvailabilityInput: $DoctorPhysicalAvailabilityInput
    ) {
      availableSlots
    }
  }
`;

export const SAVE_PATIENT_ADDRESS = gql`
  mutation savePatientAddress($PatientAddressInput: PatientAddressInput!) {
    savePatientAddress(PatientAddressInput: $PatientAddressInput) {
      patientAddress {
        id
        addressLine1
        addressLine2
        city
        state
        zipcode
        landmark
        createdDate
        updatedDate
      }
    }
  }
`;

export const GET_PATIENT_ADDRESS_LIST = gql`
  query getPatientAddressList($patientId: String) {
    getPatientAddressList(patientId: $patientId) {
      addressList {
        id
        addressLine1
        addressLine2
        city
        state
        zipcode
        landmark
        createdDate
        updatedDate
      }
    }
  }
`;

export const GET_CASESHEET_DETAILS = gql`
  query getCaseSheet($appointmentId: String) {
    getCaseSheet(appointmentId: $appointmentId) {
      caseSheetDetails {
        appointment {
          id
          appointmentDateTime
          appointmentState
          appointmentType
          doctorId
          hospitalId
          patientId
          parentId
          status
        }
        consultType
        diagnosis {
          name
        }
        diagnosticPrescription {
          itemname
        }
        doctorId
        followUp
        followUpAfterInDays
        followUpDate
        id
        medicinePrescription {
          medicineConsumptionDurationInDays
          medicineDosage
          medicineInstructions
          medicineTimings
          medicineToBeTaken
          medicineName
          id
        }
        notes
        otherInstructions {
          instruction
        }
        patientId
        symptoms {
          symptom
          since
          howOften
          severity
        }
      }
      patientDetails {
        id
      }
      juniorDoctorNotes
    }
  }
`;

export const SAVE_DEVICE_TOKEN = gql`
  mutation saveDeviceToken($SaveDeviceTokenInput: SaveDeviceTokenInput!) {
    saveDeviceToken(SaveDeviceTokenInput: $SaveDeviceTokenInput) {
      deviceToken {
        id
        deviceType
        deviceOS
        deviceToken
        createdDate
        updatedDate
      }
    }
  }
`;

// export const END_APPOINTMENT_SESSION = gql`
//   mutation endAppointmentSession($endAppointmentSessionInput: EndAppointmentSessionInput!) {
//     endAppointmentSession(endAppointmentSessionInput: $endAppointmentSessionInput) {
//     }
//   }
// `;

export const GET_PATIENT_PAST_MEDICINE_SEARCHES = gql`
  query getPatientPastMedicineSearches($patientId: ID!) {
    getPatientPastMedicineSearches(patientId: $patientId) {
      searchType
      typeId
      name
      image
    }
  }
`;

export const SAVE_MEDICINE_ORDER = gql`
  mutation SaveMedicineOrder($MedicineCartInput: MedicineCartInput!) {
    SaveMedicineOrder(MedicineCartInput: $MedicineCartInput) {
      errorCode
      errorMessage
      orderId
      orderAutoId
    }
  }
`;

export const SAVE_MEDICINE_ORDER_PAYMENT = gql`
  mutation SaveMedicineOrderPayment($medicinePaymentInput: MedicinePaymentInput!) {
    SaveMedicineOrderPayment(medicinePaymentInput: $medicinePaymentInput) {
      errorCode
      errorMessage
      # orderId
      # orderAutoId
    }
  }
`;

// export const GET_MEDICINE_ORDERS_RESULT = gql`
//   query GetMedicineOrdersList($patientId: String) {
//     MedicineOrdersList(patientId: $patientId) {
//       id
//       orderAutoId
//       deliveryType
//       medicineOrdersStatus {
//         id
//         orderStatus
//         statusDate
//       }
//     }
//   }
// `;
export const GET_NOTIFICATION_SETTINGS = gql`
  query getPatientNotificationSettings($patient: ID!) {
    getPatientNotificationSettings(patient: $patient) {
      notificationSettings {
        id
        commissionNotification
        messageFromDoctorNotification
        playNotificationSound
        reScheduleAndCancellationNotification
        paymentNotification
        upcomingAppointmentReminders
      }
    }
  }
`;

export const SAVE_NOTIFICATION_SETTINGS = gql`
  mutation savePatientNotificationSettings(
    $notificationSettingsInput: SavePatientNotificationSettingsInput!
  ) {
    savePatientNotificationSettings(notificationSettingsInput: $notificationSettingsInput) {
      status
    }
  }
`;

export const GET_PAST_CONSULTS_PRESCRIPTIONS = gql`
  query getPatientPastConsultsAndPrescriptions(
    $consultsAndOrdersInput: PatientConsultsAndOrdersInput
  ) {
    getPatientPastConsultsAndPrescriptions(consultsAndOrdersInput: $consultsAndOrdersInput) {
      consults {
        id
        patientId
        doctorId
        appointmentDateTime
        appointmentType
        appointmentState
        hospitalId
        isFollowUp
        followUpParentId
        followUpTo
        bookingDate
        caseSheet {
          consultType
          diagnosis {
            name
          }
          diagnosticPrescription {
            itemname
          }
          doctorId
          followUp
          followUpAfterInDays
          followUpDate
          id
          medicinePrescription {
            medicineConsumptionDurationInDays
            medicineDosage
            medicineInstructions
            medicineTimings
            medicineToBeTaken
            medicineName
            id
          }
          symptoms {
            symptom
            since
            howOften
            severity
          }
        }
        displayId
        status
        doctorInfo {
          id
          salutation
          firstName
          lastName
          experience
          city
          photoUrl
          qualification
          specialty {
            name
            image
          }
        }
      }
      medicineOrders {
        id
        orderDateTime
        quoteDateTime
        deliveryType
        currentStatus
        orderType
        estimatedAmount
        prescriptionImageUrl
        shopId
        medicineOrderLineItems {
          medicineSku
          medicineName
          price
          quantity
          mrp
          id
        }
      }
    }
  }
`;

export const ADD_MEDICAL_RECORD = gql`
  mutation addPatientMedicalRecord($AddMedicalRecordInput: AddMedicalRecordInput) {
    addPatientMedicalRecord(addMedicalRecordInput: $AddMedicalRecordInput) {
      status
    }
  }
`;

export const GET_MEDICAL_RECORD = gql`
  query getPatientMedicalRecords($patientId: ID!) {
    getPatientMedicalRecords(patientId: $patientId) {
      medicalRecords {
        id
        testName
        testDate
        recordType
        referringDoctor
        observations
        additionalNotes
        sourceName
        documentURLs
        medicalRecordParameters {
          parameterName
          result
        }
      }
    }
  }
`;

export const BOOK_APPOINTMENT_TRANSFER = gql`
  mutation bookTransferAppointment($BookTransferAppointmentInput: BookTransferAppointmentInput!) {
    bookTransferAppointment(BookTransferAppointmentInput: $BookTransferAppointmentInput) {
      appointment {
        id
        patientId
        doctorId
        appointmentDateTime
        appointmentType
        hospitalId
        status
        appointmentState
        patientName
      }
    }
  }
`;

export const CHOOSE_DOCTOR = gql`
  query getAvailableDoctors($ChooseDoctorInput: ChooseDoctorInput!) {
    getAvailableDoctors(ChooseDoctorInput: $ChooseDoctorInput) {
      availalbeDoctors {
        doctorId
        doctorPhoto
        doctorLastName
        doctorFirstName
        availableSlot
      }
    }
  }
`;

export const BOOK_APPOINTMENT_RESCHEDULE = gql`
  mutation bookRescheduleAppointment(
    $bookRescheduleAppointmentInput: BookRescheduleAppointmentInput!
  ) {
    bookRescheduleAppointment(bookRescheduleAppointmentInput: $bookRescheduleAppointmentInput) {
      appointmentDetails {
        appointmentType
        id
        doctorId
        appointmentState
        appointmentDateTime
        status
        patientId
      }
    }
  }
`;
