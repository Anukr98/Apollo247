import gql from 'graphql-tag';

export const GET_CURRENT_PATIENTS = gql`
  query GetCurrentPatients($appVersion: String, $deviceType: DEVICE_TYPE) {
    getCurrentPatients(appVersion: $appVersion, deviceType: $deviceType) {
      patients {
        id
        mobileNumber
        firstName
        lastName
        relation
        uhid
        gender
        dateOfBirth
        emailAddress
        gender
        dateOfBirth
        photoUrl
        patientMedicalHistory {
          bp
          dietAllergies
          drugAllergies
          height
          menstrualHistory
          pastMedicalHistory
          pastSurgicalHistory
          temperature
          weight
        }
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
        photoUrl
      }
    }
  }
`;

// export const GET_PATIENTS = gql`
//   query getPatients {
//     getPatients {
//       patients {
//         addressList {
//           id
//           addressType
//           addressLine1
//           addressLine2
//           state
//           landmark
//           createdDate
//           updatedDate
//           mobileNumber
//           city
//           otherAddressType
//         }
//         id
//         mobileNumber
//         firstName
//         lastName
//         relation
//         uhid
//         gender
//         emailAddress
//         gender
//         dateOfBirth
//       }
//     }
//   }
// `;

export const ADD_NEW_PROFILE = gql`
  mutation addNewProfile($PatientProfileInput: PatientProfileInput!) {
    addNewProfile(patientProfileInput: $PatientProfileInput) {
      patient {
        id
        uhid
        mobileNumber
        firstName
        lastName
        emailAddress
        gender
      }
    }
  }
`;

// export const EDIT_PROFILE = gql`
//   mutation editProfile($editProfileInput: EditProfileInput!) {
//     editProfile(editProfileInput: $editProfileInput) {
//       patient {
//         id
//         photoUrl
//         firstName
//         lastName
//         relation
//         gender
//         dateOfBirth
//         emailAddress
//       }
//     }
//   }
// `;
// export const DELETE_PROFILE = gql`
//   mutation deleteProfile($patientId: String) {
//     deleteProfile(patientId: $patientId) {
//       status
//     }
//   }
// `;

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

export const MAKE_APPOINTMENT_PAYMENT = gql`
  mutation makeAppointmentPayment($paymentInput: AppointmentPaymentInput) {
    makeAppointmentPayment(paymentInput: $paymentInput) {
      appointment {
        id
        amountPaid
        paymentRefId
        paymentDateTime
        responseCode
        responseMessage
        bankTxnId
        orderId
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

// export const SEARCH_DOCTOR_AND_SPECIALITY = gql`
//   query SearchDoctorAndSpecialty($searchText: String!) {
//     SearchDoctorAndSpecialty(searchText: $searchText) {
//       doctors {
//         id
//         salutation
//         firstName
//         lastName
//         experience
//         speciality
//         specialization
//         isStarDoctor
//         education
//         services
//         languages
//         city
//         address
//         photoUrl
//         availableIn
//         availableForPhysicalConsultation
//         availableForVirtualConsultation
//         isStarDoctor
//         services
//         languages
//         availableIn
//       }
//       specialties {
//         id
//         name
//         image
//       }
//       possibleMatches {
//         doctors {
//           id
//           salutation
//           firstName
//           lastName
//           experience
//           speciality
//           specialization
//           isStarDoctor
//           education
//           services
//           languages
//           city
//           address
//           photoUrl
//           availableIn
//         }
//         specialties {
//           id
//           name
//           image
//         }
//       }
//     }
//   }
// `;

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
        isSeniorConsultStarted
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

export const GET_PATIENT_FUTURE_APPOINTMENT_COUNT = gql`
  query getPatientFutureAppointmentCount($patientId: String) {
    getPatientFutureAppointmentCount(patientId: $patientId) {
      consultsCount
    }
  }
`;

export const GET_PATIENT_APPOINTMENTS = gql`
  query getPatinetAppointments($patientAppointmentsInput: PatientAppointmentsInput!) {
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
        appointmentType
        id
        patientId
        appointmentDateTime
        status
        hospitalId
        doctorId
        displayId
        isFollowUp
        rescheduleCount
        displayId
        appointmentState
        isConsultStarted
        isJdQuestionsComplete
        isSeniorConsultStarted
        symptoms
        doctorInfo {
          id
          salutation
          firstName
          lastName
          displayName
          fullName
          experience
          onlineConsultationFees
          physicalConsultationFees
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

export const GET_PATIENT_ALL_APPOINTMENTS = gql`
  query getPatientAllAppointments($patientId: String!) {
    getPatientAllAppointments(patientId: $patientId) {
      appointments {
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
        isFollowUp
        appointmentState
        displayId
        isConsultStarted
        isSeniorConsultStarted
        isJdQuestionsComplete
        symptoms
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
          }
        }
      }
    }
  }
`;

export const SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME = gql`
  query SearchDoctorAndSpecialtyByName(
    $searchText: String!
    $patientId: ID
    $geolocation: Geolocation
    $pincode: String
  ) {
    SearchDoctorAndSpecialtyByName(
      searchText: $searchText
      patientId: $patientId
      geolocation: $geolocation
      pincode: $pincode
    ) {
      doctors {
        id
        salutation
        firstName
        lastName
        displayName
        fullName
        experience
        onlineConsultationFees
        physicalConsultationFees
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
        doctorHospital {
          facility {
            id
            name
            streetLine1
            streetLine2
            streetLine3
            city
            facilityType
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
      possibleMatches {
        doctors {
          id
          salutation
          firstName
          lastName
          displayName
          fullName
          experience
          onlineConsultationFees
          physicalConsultationFees
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
          doctorHospital {
            facility {
              id
              name
              streetLine1
              streetLine2
              streetLine3
              city
              facilityType
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
      }
      otherDoctors {
        id
        salutation
        firstName
        lastName
        displayName
        fullName
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
        doctorHospital {
          facility {
            id
            name
            streetLine1
            streetLine2
            streetLine3
            city
            facilityType
          }
        }
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

export const GET_ALL_SPECIALTIES = gql`
  query getAllSpecialties {
    getAllSpecialties {
      id
      name
      image
      # specialistSingularTerm
      # specialistPluralTerm
      userFriendlyNomenclature
      # displayOrder
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
      fullName
      displayName
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
        id
        name
        userFriendlyNomenclature
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
          imageUrl
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
            id
            name
            image
            userFriendlyNomenclature
          }
          doctorType
          doctorHospital {
            facility {
              id
              name
              streetLine1
              streetLine2
              streetLine3
              city
              facilityType
            }
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
        displayName
        fullName
        experience
        city
        photoUrl
        thumbnailUrl
        qualification
        specialty {
          id
          name
          image
          userFriendlyNomenclature
        }
        onlineConsultationFees
        physicalConsultationFees
        languages
        consultHours {
          consultMode
        }
        doctorType
        doctorHospital {
          facility {
            id
            name
            streetLine1
            streetLine2
            streetLine3
            city
            facilityType
          }
        }
      }
      doctorsAvailability {
        doctorId
        availableModes
      }
      specialty {
        id
        name
        userFriendlyNomenclature
        specialistSingularTerm
        specialistPluralTerm
      }
      doctorsNextAvailability {
        doctorId
        onlineSlot
        physicalSlot
        referenceSlot
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
        physicalAvailableSlot
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
        addressType
        otherAddressType
        mobileNumber
        latitude
        longitude
      }
    }
  }
`;
export const UPDATE_PATIENT_ADDRESS = gql`
  mutation updatePatientAddress($UpdatePatientAddressInput: UpdatePatientAddressInput!) {
    updatePatientAddress(UpdatePatientAddressInput: $UpdatePatientAddressInput) {
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
        addressType
        otherAddressType
        latitude
        longitude
      }
    }
  }
`;
export const DELETE_PATIENT_ADDRESS = gql`
  mutation deletePatientAddress($id: String) {
    deletePatientAddress(id: $id) {
      status
    }
  }
`;

export const GET_PATIENT_ADDRESS_BY_ID = gql`
  query getPatientAddressById($id: String) {
    getPatientAddressById(id: $id) {
      patientAddress {
        zipcode
      }
    }
  }
`;

export const GET_PATIENTS = gql`
  query getPatients {
    getPatients {
      patients {
        addressList {
          id
          addressType
          addressLine1
          addressLine2
          state
          landmark
          createdDate
          updatedDate
          mobileNumber
          city
          otherAddressType
        }
        id
        mobileNumber
        firstName
        lastName
        relation
        uhid
        gender
        emailAddress
        gender
        dateOfBirth
      }
    }
  }
`;

// export const ADD_NEW_PROFILE = gql`
//   mutation addNewProfile($PatientProfileInput: PatientProfileInput!) {
//     addNewProfile(patientProfileInput: $PatientProfileInput) {
//       patient {
//         id
//         uhid
//         mobileNumber
//         firstName
//         lastName
//         emailAddress
//         gender
//       }
//     }
//   }
// `;

export const EDIT_PROFILE = gql`
  mutation editProfile($editProfileInput: EditProfileInput!) {
    editProfile(editProfileInput: $editProfileInput) {
      patient {
        id
        photoUrl
        firstName
        lastName
        relation
        gender
        dateOfBirth
        emailAddress
      }
    }
  }
`;
export const DELETE_PROFILE = gql`
  mutation deleteProfile($patientId: String) {
    deleteProfile(patientId: $patientId) {
      status
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
        addressType
        otherAddressType
        latitude
        longitude
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
          displayId
          isFollowUp
        }
        consultType
        diagnosis {
          name
        }
        diagnosticPrescription {
          itemname
        }
        blobName
        doctorId
        followUp
        followUpAfterInDays
        followUpDate
        doctorType
        id
        medicinePrescription {
          id
          externalId
          medicineName
          medicineDosage
          medicineToBeTaken
          medicineInstructions
          medicineTimings
          medicineUnit
          medicineConsumptionDurationInDays
          medicineConsumptionDuration
          medicineFormTypes
          medicineFrequency
          medicineConsumptionDurationUnit
          routeOfAdministration
          medicineCustomDosage
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

export const END_APPOINTMENT_SESSION = gql`
  mutation EndAppointmentSession($endAppointmentSessionInput: EndAppointmentSessionInput) {
    endAppointmentSession(endAppointmentSessionInput: $endAppointmentSessionInput)
  }
`;

export const GET_PATIENT_PAST_MEDICINE_SEARCHES = gql`
  query getPatientPastMedicineSearches($patientId: ID!, $type: SEARCH_TYPE) {
    getPatientPastMedicineSearches(patientId: $patientId, type: $type) {
      searchType
      typeId
      name
      image
    }
  }
`;

export const SAVE_MEDICINE_ORDER_OMS = gql`
  mutation saveMedicineOrderOMS($medicineCartOMSInput: MedicineCartOMSInput!) {
    saveMedicineOrderOMS(medicineCartOMSInput: $medicineCartOMSInput) {
      errorCode
      errorMessage
      orderId
      orderAutoId
    }
  }
`;

export const SAVE_MEDICINE_ORDER_PAYMENT = gql`
  mutation SaveMedicineOrderPaymentMq($medicinePaymentMqInput: MedicinePaymentMqInput!) {
    SaveMedicineOrderPaymentMq(medicinePaymentMqInput: $medicinePaymentMqInput) {
      errorCode
      errorMessage
      # orderId
      # orderAutoId
    }
  }
`;

export const GET_MEDICINE_ORDERS_LIST = gql`
  query GetMedicineOrdersList($patientId: String) {
    getMedicineOrdersList(patientId: $patientId) {
      MedicineOrdersList {
        id
        orderAutoId
        deliveryType
        medicineOrdersStatus {
          id
          orderStatus
          statusDate
          hideStatus
        }
      }
    }
  }
`;

export const GET_DIAGNOSTIC_SLOTS = gql`
  query getDiagnosticSlots(
    $patientId: String
    $hubCode: String
    $selectedDate: Date
    $zipCode: Int
  ) {
    getDiagnosticSlots(
      patientId: $patientId
      hubCode: $hubCode
      selectedDate: $selectedDate
      zipCode: $zipCode
    ) {
      diagnosticBranchCode
      diagnosticSlot {
        employeeCode
        employeeName
        slotInfo {
          endTime
          status
          startTime
          slot
        }
      }
    }
  }
`;

export const GET_DIAGNOSTIC_DATA = gql`
  query getDiagnosticsData {
    getDiagnosticsData {
      diagnosticOrgans {
        id
        organName
        organImage
        diagnostics {
          id
          itemId
          itemName
          gender
          rate
          itemRemarks
          city
          state
          itemType
          fromAgeInDays
          toAgeInDays
          testPreparationData
          collectionType
        }
      }
      diagnosticHotSellers {
        id
        packageName
        price
        packageImage
        diagnostics {
          id
          itemId
          itemName
          gender
          rate
          itemRemarks
          city
          state
          itemType
          fromAgeInDays
          toAgeInDays
          testPreparationData
          collectionType
        }
      }
    }
  }
`;

export const GET_DIAGNOSTIC_ORDER_LIST = gql`
  query getDiagnosticOrdersList($patientId: String) {
    getDiagnosticOrdersList(patientId: $patientId) {
      ordersList {
        id
        patientAddressId
        city
        slotTimings
        employeeSlotId
        diagnosticEmployeeCode
        diagnosticBranchCode
        totalPrice
        prescriptionUrl
        diagnosticDate
        centerName
        centerCode
        centerCity
        centerState
        centerLocality
        orderStatus
        orderType
        displayId
        createdDate
        diagnosticOrderLineItems {
          id
          itemId
          quantity
          price
          diagnostics {
            id
            itemId
            itemName
          }
        }
      }
    }
  }
`;

export const GET_DIAGNOSTIC_ORDER_LIST_DETAILS = gql`
  query getDiagnosticOrderDetails($diagnosticOrderId: String) {
    getDiagnosticOrderDetails(diagnosticOrderId: $diagnosticOrderId) {
      ordersList {
        id
        patientAddressId
        city
        slotTimings
        employeeSlotId
        diagnosticEmployeeCode
        diagnosticBranchCode
        totalPrice
        prescriptionUrl
        diagnosticDate
        centerName
        centerCode
        centerCity
        centerState
        centerLocality
        orderStatus
        orderType
        displayId
        createdDate
        diagnosticOrderLineItems {
          id
          itemId
          price
          quantity
          diagnostics {
            id
            itemId
            itemName
            gender
            rate
            itemRemarks
            city
            state
            itemType
            fromAgeInDays
            collectionType
          }
        }
      }
    }
  }
`;

export const CANCEL_DIAGNOSTIC_ORDER = gql`
  mutation cancelDiagnosticOrder($diagnosticOrderId: Int) {
    cancelDiagnosticOrder(diagnosticOrderId: $diagnosticOrderId) {
      message
    }
  }
`;

export const UPDATE_DIAGNOSTIC_ORDER = gql`
  mutation updateDiagnosticOrder($updateDiagnosticOrderInput: UpdateDiagnosticOrderInput) {
    updateDiagnosticOrder(updateDiagnosticOrderInput: $updateDiagnosticOrderInput) {
      message
    }
  }
`;

export const GET_MEDICINE_ORDER_DETAILS = gql`
  query GetMedicineOrderDetails($patientId: String, $orderAutoId: Int) {
    getMedicineOrderDetails(patientId: $patientId, orderAutoId: $orderAutoId) {
      MedicineOrderDetails {
        id
        orderAutoId
        devliveryCharges
        estimatedAmount
        prescriptionImageUrl
        orderTat
        orderType
        currentStatus
        patientAddressId
        medicineOrdersStatus {
          id
          orderStatus
          statusDate
          hideStatus
        }
        medicineOrderLineItems {
          medicineSKU
          medicineName
          price
          mrp
          quantity
          isMedicine
          mou
        }
        medicineOrderPayments {
          paymentType
          amountPaid
          paymentStatus
          paymentDateTime
          bankTxnId
        }
        
      }
    }
  }
`;

export const UPLOAD_FILE = gql`
  mutation uploadFile($fileType: String, $base64FileInput: String) {
    uploadFile(fileType: $fileType, base64FileInput: $base64FileInput) {
      filePath
    }
  }
`;

export const SAVE_PRESCRIPTION_MEDICINE_ORDER = gql`
  mutation SavePrescriptionMedicineOrder($prescriptionMedicineInput: PrescriptionMedicineInput) {
    SavePrescriptionMedicineOrder(prescriptionMedicineInput: $prescriptionMedicineInput) {
      status
      orderId
      orderAutoId
      errorCode
      errorMessage
    }
  }
`;

export const SEND_HELP_EMAIL = gql`
  query SendHelpEmail($helpEmailInput: HelpEmailInput) {
    sendHelpEmail(helpEmailInput: $helpEmailInput)
  }
`;

export const GET_COUPONS = gql`
  query getCoupons {
    getCoupons {
      coupons {
        id
        code
        description
        discountType
        discount
        minimumOrderAmount
        expirationDate
        isActive
      }
    }
  }
`;

export const VALIDATE_CONSULT_COUPON = gql`
  query ValidateConsultCoupon(
    $doctorId: ID!
    $code: String!
    $consultType: AppointmentType!
    $appointmentDateTimeInUTC: DateTime!
  ) {
    validateConsultCoupon(
      doctorId: $doctorId
      code: $code
      consultType: $consultType
      appointmentDateTimeInUTC: $appointmentDateTimeInUTC
    ) {
      validityStatus
      revisedAmount
      reasonForInvalidStatus
    }
  }
`;

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

// export const GET_PAST_CONSULTS_PRESCRIPTIONS = gql`
//   query getPatientPastConsultsAndPrescriptions(
//     $consultsAndOrdersInput: PatientConsultsAndOrdersInput
//   ) {
//     getPatientPastConsultsAndPrescriptions(consultsAndOrdersInput: $consultsAndOrdersInput) {
//       consults {
//         id
//         patientId
//         doctorId
//         appointmentDateTime
//         appointmentType
//         appointmentState
//         hospitalId
//         isFollowUp
//         followUpParentId
//         followUpTo
//         bookingDate
//         caseSheet {
//           consultType
//           diagnosis {
//             name
//           }
//           diagnosticPrescription {
//             itemname
//           }
//           doctorId
//           followUp
//           followUpAfterInDays
//           followUpDate
//           id
//           medicinePrescription {
//             medicineConsumptionDurationInDays
//             medicineDosage
//             medicineInstructions
//             medicineTimings
//             medicineToBeTaken
//             medicineName
//             id
//           }
//           symptoms {
//             symptom
//             since
//             howOften
//             severity
//           }
//         }
//         displayId
//         status
//         doctorInfo {
//           id
//           salutation
//           firstName
//           lastName
//           experience
//           city
//           photoUrl
//           qualification
//           specialty {
//             name
//             image
//           }
//         }
//       }
//       medicineOrders {
//         id
//         orderDateTime
//         quoteDateTime
//         deliveryType
//         currentStatus
//         orderType
//         estimatedAmount
//         prescriptionImageUrl
//         shopId
//         medicineOrderLineItems {
//           medicineSku
//           medicineName
//           price
//           quantity
//           mrp
//           id
//         }
//       }
//     }
//   }
// `;

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
        prismFileIds
        issuingDoctor
        location
        medicalRecordParameters {
          id
          parameterName
          unit
          result
          minimum
          maximum
        }
      }
    }
  }
`;

export const GET_MEDICAL_PRISM_RECORD = gql`
  query getPatientPrismMedicalRecords($patientId: ID!) {
    getPatientPrismMedicalRecords(patientId: $patientId) {
      labTests {
        id
        labTestName
        labTestSource
        labTestDate
        labTestReferredBy
        additionalNotes
        testResultPrismFileIds
        observation
        labTestResultParameters {
          parameterName
          unit
          result
          range
          setOutOfRange
          setResultDate
          setUnit
          setParameterName
          setRange
          setResult
        }
        departmentName
        signingDocName
      }
      healthChecks {
        id
        healthCheckName
        healthCheckDate
        healthCheckPrismFileIds
        healthCheckSummary
        source
        appointmentDate
        followupDate
      }
      hospitalizations {
        id
        diagnosisNotes
        dateOfDischarge
        dateOfHospitalization
        dateOfNextVisit
        hospitalizationPrismFileIds
        source
      }
    }
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation cancelAppointment($cancelAppointmentInput: CancelAppointmentInput!) {
    cancelAppointment(cancelAppointmentInput: $cancelAppointmentInput) {
      status
    }
  }
`;

export const BOOK_FOLLOWUP_APPOINTMENT = gql`
  mutation BookFollowUpAppointment($followUpAppointmentInput: BookFollowUpAppointmentInput!) {
    bookFollowUpAppointment(followUpAppointmentInput: $followUpAppointmentInput) {
      appointment {
        id
        isFollowUp
        doctorId
        appointmentType
        appointmentState
        appointmentDateTime
        patientId
        status
      }
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
        displayId
        bookingDate
        caseSheet {
          notes
          blobName
          consultType
          diagnosis {
            name
          }
          diagnosticPrescription {
            itemname
          }
          doctorId
          doctorType
          followUp
          followUpAfterInDays
          followUpDate
          id

          medicinePrescription {
            id
            externalId
            medicineName
            medicineDosage
            medicineToBeTaken
            medicineInstructions
            medicineTimings
            medicineUnit
            medicineConsumptionDurationInDays
            medicineConsumptionDuration
            medicineFormTypes
            medicineFrequency
            medicineConsumptionDurationUnit
            routeOfAdministration
            medicineCustomDosage
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
          displayName
          fullName
          experience
          city
          onlineConsultationFees
          physicalConsultationFees
          photoUrl
          qualification
          specialty {
            id
            name
            userFriendlyNomenclature
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
        prismPrescriptionFileId
        medicineOrderLineItems {
          medicineSKU
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
        specialityName
        experience
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
        rescheduleCount
      }
    }
  }
`;

export const DELETE_PATIENT_MEDICAL_RECORD = gql`
  mutation deletePatientMedicalRecord($recordId: ID!) {
    deletePatientMedicalRecord(recordId: $recordId) {
      status
    }
  }
`;

export const CHECK_IF_RESCHDULE = gql`
  query checkIfReschedule($existAppointmentId: String!, $rescheduleDate: DateTime!) {
    checkIfReschedule(existAppointmentId: $existAppointmentId, rescheduleDate: $rescheduleDate) {
      isPaid
      isCancel
      isFollowUp
      appointmentState
      rescheduleCount
    }
  }
`;

export const GET_APPOINTMENT_DATA = gql`
  query getAppointmentData($appointmentId: String!) {
    getAppointmentData(appointmentId: $appointmentId) {
      appointmentsHistory {
        appointmentType
        id
        patientId
        appointmentDateTime
        status
        hospitalId
        doctorId
        isFollowUp
        displayId
        rescheduleCount
        appointmentState
        isJdQuestionsComplete
        isSeniorConsultStarted
        doctorInfo {
          id
          salutation
          firstName
          lastName
          displayName
          fullName
          experience
          onlineConsultationFees
          physicalConsultationFees
          specialty {
            id
            name
            userFriendlyNomenclature
          }
          qualification
          city
          photoUrl
          thumbnailUrl
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
        caseSheet {
          id
          blobName
          sentToPatient
        }
      }
    }
  }
`;

export const ADD_TO_CONSULT_QUEUE = gql`
  mutation addToConsultQueue($appointmentId: String!) {
    addToConsultQueue(appointmentId: $appointmentId) {
      id
      doctorId
      totalJuniorDoctorsOnline
      juniorDoctorsList {
        juniorDoctorId
        doctorName
        queueCount
      }
      totalJuniorDoctors
    }
  }
`;

export const CHECK_IF_FOLLOWUP_BOOKED = gql`
  query checkIfFollowUpBooked($appointmentId: String!) {
    checkIfFollowUpBooked(appointmentId: $appointmentId)
  }
`;

export const UPLOAD_CHAT_FILE = gql`
  mutation uploadChatDocument($fileType: String, $base64FileInput: String, $appointmentId: String) {
    uploadChatDocument(
      fileType: $fileType
      base64FileInput: $base64FileInput
      appointmentId: $appointmentId
    ) {
      filePath
    }
  }
`;

export const CANCEL_MEDICINE_ORDER = gql`
  mutation cancelMedicineOrder($medicineOrderCancelInput: MedicineOrderCancelInput) {
    cancelMedicineOrder(medicineOrderCancelInput: $medicineOrderCancelInput) {
      orderStatus
    }
  }
`;

export const GET_CALL_DETAILS = gql`
  query getCallDetails($appointmentCallId: String) {
    getCallDetails(appointmentCallId: $appointmentCallId) {
      appointmentCallDetails {
        id
        callType
        doctorType
        startTime
        endTime
        createdDate
        updatedDate
      }
    }
  }
`;

export const DELETE_DEVICE_TOKEN = gql`
  mutation deleteDeviceToken($deviceToken: String, $patientId: String) {
    deleteDeviceToken(deviceToken: $deviceToken, patientId: $patientId) {
      status
    }
  }
`;

export const SEARCH_DIAGNOSTICS = gql`
  query searchDiagnostics($city: String, $patientId: String, $searchText: String!) {
    searchDiagnostics(city: $city, patientId: $patientId, searchText: $searchText) {
      diagnostics {
        id
        itemId
        itemName
        itemType
        rate
        itemType
        gender
        itemRemarks
        city
        state
        collectionType
        fromAgeInDays
        toAgeInDays
        testPreparationData
      }
    }
  }
`;

export const SEARCH_DIAGNOSTICS_BY_ID = gql`
  query searchDiagnosticsById($itemIds: String) {
    searchDiagnosticsById(itemIds: $itemIds) {
      diagnostics {
        id
        itemId
        itemName
        itemType
        rate
        itemType
        gender
        itemRemarks
        city
        state
        collectionType
        fromAgeInDays
        toAgeInDays
        testPreparationData
      }
    }
  }
`;

export const GET_DIAGNOSTICS_CITES = gql`
  query getDiagnosticsCites($patientId: String, $cityName: String) {
    getDiagnosticsCites(patientId: $patientId, cityName: $cityName) {
      diagnosticsCities {
        cityname
        statename
        cityid
        stateid
      }
    }
  }
`;

export const SAVE_DIAGNOSTIC_ORDER = gql`
  mutation SaveDiagnosticOrder($diagnosticOrderInput: DiagnosticOrderInput) {
    SaveDiagnosticOrder(diagnosticOrderInput: $diagnosticOrderInput) {
      errorCode
      errorMessage
      orderId
      displayId
    }
  }
`;

export const UPLOAD_DOCUMENT = gql`
  mutation uploadDocument($UploadDocumentInput: UploadDocumentInput) {
    uploadDocument(uploadDocumentInput: $UploadDocumentInput) {
      status
      fileId
      filePath
    }
  }
`;

export const DOWNLOAD_DOCUMENT = gql`
  query downloadDocuments($downloadDocumentsInput: DownloadDocumentsInput!) {
    downloadDocuments(downloadDocumentsInput: $downloadDocumentsInput) {
      downloadPaths
    }
  }
`;
export const UPLOAD_CHAT_FILE_PRISM = gql`
  mutation uploadChatDocumentToPrism(
    $fileType: UPLOAD_FILE_TYPES!
    $base64FileInput: String!
    $appointmentId: String
    $patientId: String!
  ) {
    uploadChatDocumentToPrism(
      fileType: $fileType
      base64FileInput: $base64FileInput
      appointmentId: $appointmentId
      patientId: $patientId
    ) {
      status
      fileId
    }
  }
`;

export const ADD_PATIENT_FEEDBACK = gql`
  mutation addPatientFeedback($patientFeedbackInput: PatientFeedbackInput) {
    addPatientFeedback(patientFeedbackInput: $patientFeedbackInput) {
      status
    }
  }
`;

export const AUTOMATED_QUESTIONS = gql`
  mutation addToConsultQueueWithAutomatedQuestions($ConsultQueueInput: ConsultQueueInput) {
    addToConsultQueueWithAutomatedQuestions(consultQueueInput: $ConsultQueueInput) {
      id
      doctorId
      totalJuniorDoctorsOnline
      juniorDoctorsList {
        juniorDoctorId
        doctorName
        queueCount
      }
      totalJuniorDoctors
    }
  }
`;

export const LOGIN = gql`
  query Login($mobileNumber: String!, $loginType: LOGIN_TYPE!) {
    login(mobileNumber: $mobileNumber, loginType: $loginType) {
      status
      message
      loginId
    }
  }
`;

export const VERIFY_LOGIN_OTP = gql`
  query verifyLoginOtp($otpVerificationInput: OtpVerificationInput) {
    verifyLoginOtp(otpVerificationInput: $otpVerificationInput) {
      status
      authToken
      isBlocked
      reason
      incorrectAttempts
    }
  }
`;

export const RESEND_OTP = gql`
  query resendOtp($mobileNumber: String!, $loginType: LOGIN_TYPE!, $id: String!) {
    resendOtp(mobileNumber: $mobileNumber, loginType: $loginType, id: $id) {
      status
      message
      loginId
    }
  }
`;

export const GET_PATIENTS_MOBILE = gql`
  query getPatientByMobileNumber($mobileNumber: String) {
    getPatientByMobileNumber(mobileNumber: $mobileNumber) {
      patients {
        id
        uhid
        firstName
        lastName
        mobileNumber
        dateOfBirth
        emailAddress
        gender
        relation
        photoUrl
        patientMedicalHistory {
          bp
          dietAllergies
          drugAllergies
          height
          menstrualHistory
          pastMedicalHistory
          pastSurgicalHistory
          temperature
          weight
        }
      }
    }
  }
`;

export const SEND_CHAT_MESSAGE_TO_DOCTOR = gql`
  query sendChatMessageToDoctor($appointmentId: String) {
    sendChatMessageToDoctor(appointmentId: $appointmentId) {
      status
    }
  }
`;

export const GET_DEVICE_TOKEN_COUNT = gql`
  query getDeviceCodeCount($deviceCode: String!) {
    getDeviceCodeCount(deviceCode: $deviceCode) {
      deviceCount
    }
  }
`;

export const GET_TRANSACTION_STATUS = gql`
  query paymentTransactionStatus($appointmentId: String!) {
    paymentTransactionStatus(appointmentId: $appointmentId) {
      appointment {
        displayId
        bankTxnId
        paymentStatus
        amountPaid
      }
    }
  }
`;

export const CONSULT_ORDER_PAYMENT_DETAILS = gql`
  query consultOrders($patientId: String!) {
    consultOrders(patientId: $patientId) {
      appointments {
        id
        doctorId
        displayId
        appointmentDateTime
        actualAmount
        status
        appointmentType
        discountedAmount
        appointmentPayments {
          paymentRefId
          paymentStatus
        }
        doctor {
          name
        }
      }
    }
  }
`;

export const PHARMACY_ORDER_PAYMENT_DETAILS = gql`
  query pharmacyOrders($patientId: String!) {
    pharmacyOrders(patientId: $patientId) {
      pharmaOrders {
        id
        estimatedAmount
        devliveryCharges
        bookingSource
        orderAutoId
        appointmentId
        currentStatus
        orderType
        orderDateTime
        quoteDateTime
        medicineOrderPayments {
          paymentType
          paymentRefId
          paymentStatus
          paymentDateTime
        }
      }
    }
  }
`;

export const INSERT_MESSAGE = gql`
  mutation insertMessage($messageInput: MessageInput) {
    insertMessage(messageInput: $messageInput) {
      notificationData {
        fromId
        toId
        eventName
        eventId
        message
        status
        type
        id
      }
    }
  }
`;

export const GET_PHARMA_TRANSACTION_STATUS = gql`
  query pharmaPaymentStatus($orderId: Int!) {
    pharmaPaymentStatus(orderId: $orderId) {
      paymentRefId
      bankTxnId
      amountPaid
      paymentStatus
      paymentDateTime
    }
  }
`;
