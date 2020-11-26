import gql from 'graphql-tag';

export const GET_CURRENT_PATIENTS = gql`
  query GetCurrentPatients(
    $appVersion: String
    $deviceType: DEVICE_TYPE
    $deviceToken: String
    $deviceOS: String
  ) {
    getCurrentPatients(
      appVersion: $appVersion
      deviceType: $deviceType
      deviceToken: $deviceToken
      deviceOS: $deviceOS
    ) {
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
        athsToken
        referralCode
        isLinked
        isUhidPrimary
        primaryUhid
        primaryPatientId
        whatsAppMedicine
        whatsAppConsult
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

export const INITIATE_CALL_FOR_PARTNER = gql`
  query initiateCallForPartner($mobileNumber: String!, $benefitId: String!) {
    initiateCallForPartner(mobileNumber: $mobileNumber, benefitId: $benefitId) {
      success
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
        dateOfBirth
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

export const PAST_APPOINTMENTS_COUNT = gql`
  query getPastAppointmentsCount($doctorId: String!, $patientId: String!, $appointmentId: String!) {
    getPastAppointmentsCount(
      doctorId: $doctorId
      patientId: $patientId
      appointmentId: $appointmentId
    ) {
      count
      completedCount
      yesCount
      noCount
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
        displayId
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
        caseSheet {
          symptoms {
            symptom
            details
          }
        }
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
      activeAndInProgressConsultsCount
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
        hideHealthRecordNudge
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
          chatDays
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
        caseSheet {
          followUpAfterInDays
          version
          doctorType
          medicinePrescription {
            id
            medicineName
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
      specialistSingularTerm
      specialistPluralTerm
      userFriendlyNomenclature
      # displayOrder
      shortDescription
      symptoms
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
      chatDays
      doctorsOfTheHourStatus
      qualification
      mobileNumber
      experience
      specialization
      languages
      city
      awards
      photoUrl
      availableModes
      doctorPricing {
        slashed_price
        available_to
        status
        mrp
        appointment_type
      }
      availabilityTitle {
        AVAILABLE_NOW
        CONSULT_NOW
        DOCTOR_OF_HOUR
      }
      specialty {
        id
        name
        userFriendlyNomenclature
      }
      registrationNumber
      onlineConsultationFees
      physicalConsultationFees
      doctorSecretary {
        secretary {
          id
          name
          mobileNumber
          isActive
        }
      }
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
          fullName
          displayName
          experience
          city
          photoUrl
          qualification
          thumbnailUrl
          physicalConsultationFees
          onlineConsultationFees
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
      doctorNextAvailSlots {
        onlineSlot
        physicalSlot
      }
    }
  }
`;

export const GET_PLATINUM_DOCTOR = gql`
  query getPlatinumDoctor($specialtyId: ID) {
    getPlatinumDoctor(specialtyId: $specialtyId) {
      doctors {
        id
        displayName
        doctorType
        consultMode
        earliestSlotInMinutes
        doctorfacility
        fee
        specialistPluralTerm
        specialistPluralTerm
        specialtydisplayName
        doctorType
        qualification
        experience
        photoUrl
        slot
        thumbnailUrl
        availabilityTitle {
          AVAILABLE_NOW
          CONSULT_NOW
          DOCTOR_OF_HOUR
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
      sort
      filters {
        city {
          state
          data
        }
        brands {
          name
          image
          brandName
        }
        language {
          name
        }
        experience {
          name
        }
        availability {
          name
        }
        fee {
          name
        }
        gender {
          name
        }
      }
      apolloDoctorCount
      partnerDoctorCount
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
        stateCode
        name
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
        stateCode
        mobileNumber
        name
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
        addressLine1
        addressLine2
        city
        state
        zipcode
        landmark
        mobileNumber
        name
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
        stateCode
        mobileNumber
        name
        defaultAddress
      }
    }
  }
`;

export const GET_SD_LATEST_COMPLETED_CASESHEET_DETAILS = gql`
  query getSDLatestCompletedCaseSheet($appointmentId: String) {
    getSDLatestCompletedCaseSheet(appointmentId: $appointmentId) {
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
          doctorInfo {
            id
            fullName
            gender
            photoUrl
            displayName
          }
        }
        consultType
        diagnosis {
          name
        }
        diagnosticPrescription {
          itemname
          testInstruction
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
          medicineCustomDetails
          includeGenericNameInPrescription
          genericName
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
        referralSpecialtyName
        referralDescription
        prescriptionGeneratedDate
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

export const GET_RECOMMENDED_PRODUCTS_LIST = gql`
  query getRecommendedProductsList($patientUhid: String!) {
    getRecommendedProductsList(patientUhid: $patientUhid) {
      recommendedProducts {
        productSku
        productName
        productImage
        productPrice
        productSpecialPrice
        isPrescriptionNeeded
        categoryName
        status
        mou
      }
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

export const GET_MEDICINE_ORDERS_OMS__LIST = gql`
  query getMedicineOrdersOMSList($patientId: String) {
    getMedicineOrdersOMSList(patientId: $patientId) {
      medicineOrdersList {
        id
        createdDate
        orderAutoId
        billNumber
        shopAddress
        deliveryType
        currentStatus
        oldOrderTat
        orderTat
        medicineOrdersStatus {
          id
          # statusDate
          orderStatus
          hideStatus
          statusMessage
        }
        medicineOrderLineItems {
          medicineName
        }
        medicineOrderShipments {
          medicineOrderInvoice {
            itemDetails
          }
        }
      }
    }
  }
`;

export const GET_LATEST_MEDICINE_ORDER = gql`
  query getLatestMedicineOrder($patientUhid: String!) {
    getLatestMedicineOrder(patientUhid: $patientUhid) {
      medicineOrderDetails {
        id
        createdDate
        orderAutoId
        billNumber
        shopAddress
        prescriptionImageUrl
        medicineOrderLineItems {
          medicineSKU
          medicineName
          price
          mrp
          quantity
        }
        # medicineOrdersStatus {
        #   statusDate
        # }
        medicineOrderShipments {
          medicineOrderInvoice {
            itemDetails
          }
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
        areaId
        rescheduleCount
      	isRescheduled
        diagnosticOrderLineItems {
          id
          itemId
          quantity
          price
          groupPlan
          pricingObj{
            mrp
            price
            groupPlan
          }
          diagnostics {
            id
            itemId
            itemName
            itemType
            testPreparationData
            testDescription
            inclusions
            diagnosticPricing {
              mrp
              price
              groupPlan
              status
              startDate
              endDate
            }
          }
        }
      }
    }
  }
`;

export const GET_DIAGNOSTIC_ORDER_STATUS = gql`
  query getDiagnosticsOrderStatus($diagnosticOrderId: String) {
    getDiagnosticsOrderStatus(diagnosticOrderId: $diagnosticOrderId) {
      ordersList {
        statusDate
        orderStatus
        itemId
        itemName
        packageId
        packageName
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
          groupPlan
          pricingObj{
            mrp
            price
            groupPlan
          }
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
            testDescription
            diagnosticPricing {
              mrp
              price
              groupPlan
              status
              startDate
              endDate
            }
          }
        }
        diagnosticOrdersStatus {
          orderStatus
          itemId
          statusDate
          packageId
        }
      }
    }
  }
`;

export const GET_DIAGNOSTICS_HC_CHARGES = gql`
  query getDiagnosticsHCCharges(
    $itemIDs: [Int]!
    $totalCharges: Int!
    $slotID: String!
    $pincode: Int!
  ) {
    getDiagnosticsHCCharges(
      itemIDs: $itemIDs
      totalCharges: $totalCharges
      slotID: $slotID
      pincode: $pincode
    ) {
      charges
    }
  }
`;

export const GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID = gql`
  query findDiagnosticsByItemIDsAndCityID($cityID: Int!, $itemIDs: [Int]!) {
    findDiagnosticsByItemIDsAndCityID(cityID: $cityID, itemIDs: $itemIDs) {
      diagnostics {
        id
        itemId
        itemName
        itemType
        rate
        gender
        itemRemarks
        city
        state
        collectionType
        fromAgeInDays
        toAgeInDays
        testPreparationData
        diagnosticPricing {
          mrp
          price
          groupPlan
          status
          startDate
          endDate
        }
        testDescription
        inclusions
      }
    }
  }
`;

export const GET_DIAGNOSTIC_ORDER_ITEM = gql`
  query getDiagnosticOrderItem($diagnosticOrderID: String!, $itemID: Int!) {
    getDiagnosticOrderItem(diagnosticOrderID: $diagnosticOrderID, itemID: $itemID) {
      diagnostics {
        itemName
        rate
        itemType
        rate
        gender
        itemRemarks
        city
        state
        collectionType
        fromAgeInDays
        toAgeInDays
        testPreparationData
        diagnosticPricing {
          mrp
          price
          groupPlan
          status
          startDate
          endDate
        }
        testDescription
      }
    }
  }
`;

export const GET_DIAGNOSTIC_HOME_PAGE_ITEMS = gql`
  query getDiagnosticsHomePageItems($cityID: Int!) {
    getDiagnosticsHomePageItems(cityID: $cityID) {
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
          testDescription
          collectionType
          inclusions
          diagnosticPricing {
            mrp
            price
            groupPlan
            status
            startDate
            endDate
          }
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
          testDescription
          collectionType
          inclusions
          diagnosticPricing {
            mrp
            price
            groupPlan
            status
            startDate
            endDate
          }
        }
      }
    }
  }
`;
export const VALIDATE_DIAGNOSTIC_COUPON = gql`
  mutation vaidateDiagnosticCoupon($couponInput: CouponInput) {
    vaidateDiagnosticCoupon(couponInput: $couponInput) {
      status
      message
      uniqueid
      data {
        tests {
          itemid
          itemName
          discamount
          rate
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

export const GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS = gql`
  query getMedicineOrderOMSDetailsWithAddress(
    $patientId: String
    $orderAutoId: Int
    $billNumber: String
  ) {
    getMedicineOrderOMSDetailsWithAddress(
      patientId: $patientId
      orderAutoId: $orderAutoId
      billNumber: $billNumber
    ) {
      medicineOrderDetails {
        id
        createdDate
        orderAutoId
        billNumber
        coupon
        devliveryCharges
        prismPrescriptionFileId
        couponDiscount
        productDiscount
        redeemedAmount
        estimatedAmount
        prescriptionImageUrl
        orderTat
        oldOrderTat
        orderType
        shopAddress
        packagingCharges
        deliveryType
        currentStatus
        patientAddressId
        alertStore
        prescriptionOptionSelected
        tatType
        shopId
        totalCashback
        medicineOrderLineItems {
          medicineSKU
          medicineName
          price
          mrp
          quantity
          isMedicine
          mou
          isPrescriptionNeeded
        }
        medicineOrderPayments {
          id
          paymentType
          amountPaid
          paymentRefId
          paymentStatus
          paymentDateTime
          responseCode
          responseMessage
          bankTxnId
          healthCreditsRedeemed
          healthCreditsRedemptionRequest {
            Success
            Message
            RequestNumber
            AvailablePoints
            BalancePoints
            RedeemedPoints
            PointsValue
          }
          paymentMode
          refundAmount
        }
        medicineOrderRefunds {
          refundAmount
          refundStatus
          refundId
          orderId
          createdDate
        }
        medicineOrdersStatus {
          id
          orderStatus
          statusDate
          hideStatus
          statusMessage
          customReason
        }
        medicineOrderShipments {
          id
          siteId
          siteName
          apOrderNo
          updatedDate
          currentStatus
          itemDetails
          medicineOrdersStatus {
            id
            orderStatus
            statusDate
            hideStatus
          }
          medicineOrderInvoice {
            id
            siteId
            remarks
            requestType
            vendorName
            billDetails
            itemDetails
          }
        }
        patient {
          mobileNumber
          id
          firstName
          lastName
          addressList {
            id
            addressLine1
            addressLine2
            city
            state
            zipcode
          }
        }
        medicineOrderAddress {
          addressLine1
          addressLine2
          city
          state
          zipcode
        }
      }
    }
  }
`;

export const GET_MEDICINE_ORDER_OMS_DETAILS = gql`
  query getMedicineOrderOMSDetails($patientId: String, $orderAutoId: Int, $billNumber: String) {
    getMedicineOrderOMSDetails(
      patientId: $patientId
      orderAutoId: $orderAutoId
      billNumber: $billNumber
    ) {
      medicineOrderDetails {
        id
        createdDate
        orderAutoId
        billNumber
        devliveryCharges
        couponDiscount
        productDiscount
        redeemedAmount
        estimatedAmount
        prescriptionImageUrl
        oldOrderTat
        orderTat
        oldOrderTat
        orderType
        shopAddress
        packagingCharges
        deliveryType
        currentStatus
        patientAddressId
        alertStore
        prescriptionOptionSelected
        totalCashback
        medicineOrdersStatus {
          id
          orderStatus
          statusDate
          hideStatus
          statusMessage
        }
        medicineOrderLineItems {
          medicineSKU
          medicineName
          price
          mrp
          quantity
          isMedicine
          mou
          isPrescriptionNeeded
        }
        medicineOrderPayments {
          id
          paymentType
          amountPaid
          paymentRefId
          paymentStatus
          paymentDateTime
          responseCode
          responseMessage
          bankTxnId
          healthCreditsRedeemed
          paymentMode
        }
        medicineOrderRefunds {
          refundAmount
          refundStatus
          refundId
          orderId
          createdDate
        }
        medicineOrderShipments {
          id
          siteId
          siteName
          apOrderNo
          updatedDate
          currentStatus
          itemDetails
          medicineOrdersStatus {
            id
            orderStatus
            statusDate
            hideStatus
          }
          medicineOrderInvoice {
            id
            siteId
            remarks
            requestType
            vendorName
            billDetails
            itemDetails
          }
        }
        patient {
          firstName
          lastName
          addressList {
            id
            addressLine1
            addressLine2
            city
            state
            zipcode
          }
        }
      }
    }
  }
`;

export const RE_UPLOAD_PRESCRIPTION = gql`
  mutation ReUploadPrescription($prescriptionInput: PrescriptionReUploadInput) {
    reUploadPrescription(prescriptionInput: $prescriptionInput) {
      success
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

export const GET_PATIENT_FEEDBACK = gql`
  query GetPatientFeedback($patientId: String, $transactionId: String) {
    getPatientFeedback(patientId: $patientId, transactionId: $transactionId) {
      feedback {
        rating
      }
    }
  }
`;

export const SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS = gql`
  mutation savePrescriptionMedicineOrderOMS(
    $prescriptionMedicineOMSInput: PrescriptionMedicineOrderOMSInput
  ) {
    savePrescriptionMedicineOrderOMS(prescriptionMedicineOMSInput: $prescriptionMedicineOMSInput) {
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

export const GET_PHARMA_COUPON_LIST = gql`
  query getPharmaCouponList {
    getPharmaCouponList {
      coupons {
        code
        couponConsultRule {
          couponApplicability
          id
        }
        couponPharmaRule {
          couponCategoryApplicable
          discountApplicableOn
          messageOnCouponScreen
          successMessage
        }
        couponGenericRule {
          id
          minimumCartValue
          maximumCartValue
          couponDueDate
          couponEndDate
          couponStartDate
          couponReuseCount
          couponReuseCountPerCustomer
          couponApplicableCustomerType
          discountType
          discountValue
        }
        createdDate
        description
        id
        isActive
        displayStatus
      }
    }
  }
`;

export const VALIDATE_PHARMA_COUPON = gql`
  query validatePharmaCoupon($pharmaCouponInput: PharmaCouponInput) {
    validatePharmaCoupon(pharmaCouponInput: $pharmaCouponInput) {
      discountedTotals {
        couponDiscount
        mrpPriceTotal
        productDiscount
      }
      pharmaLineItemsWithDiscountedPrice {
        applicablePrice
        discountedPrice
        itemId
        mrp
        productName
        productType
        quantity
        specialPrice
      }
      successMessage
      reasonForInvalidStatus
      validityStatus
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

export const ADD_PATIENT_HEALTH_CHECK_RECORD = gql`
  mutation addPatientHealthCheckRecord($AddHealthCheckRecordInput: AddHealthCheckRecordInput) {
    addPatientHealthCheckRecord(addHealthCheckRecordInput: $AddHealthCheckRecordInput) {
      status
    }
  }
`;

export const ADD_PATIENT_HOSPITALIZATION_RECORD = gql`
  mutation addPatientHospitalizationRecord(
    $AddHospitalizationRecordInput: AddHospitalizationRecordInput
  ) {
    addPatientHospitalizationRecord(addHospitalizationRecordInput: $AddHospitalizationRecordInput) {
      status
    }
  }
`;

export const ADD_PATIENT_LAB_TEST_RECORD = gql`
  mutation addPatientLabTestRecord($AddLabTestRecordInput: AddLabTestRecordInput) {
    addPatientLabTestRecord(addLabTestRecordInput: $AddLabTestRecordInput) {
      status
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
      labResults {
        response {
          id
          labTestName
          labTestSource
          packageId
          packageName
          # labTestDate
          date
          labTestRefferedBy
          siteDisplayName
          tag
          consultId
          additionalNotes
          observation
          labTestResults {
            parameterName
            unit
            result
            range
            outOfRange
            # resultDate
          }
          fileUrl
          testResultFiles {
            id
            fileName
            mimeType
          }
        }
        errorCode
        errorMsg
        errorType
      }
      prescriptions {
        response {
          id
          prescriptionName
          date
          # dateOfPrescription
          # startDate
          # endDate
          prescribedBy
          notes
          prescriptionSource
          source
          fileUrl
          prescriptionFiles {
            id
            fileName
            mimeType
          }
          hospital_name
          hospitalId
        }
        errorCode
        errorMsg
        errorType
      }
      healthChecksNew {
        errorCode
        errorMsg
        errorType
        response {
          authToken
          userId
          id
          fileUrl
          date
          healthCheckName
          healthCheckDate
          healthCheckSummary
          healthCheckFiles {
            id
            fileName
            mimeType
            content
            byteContent
            dateCreated
          }
          source
          healthCheckType
          followupDate
        }
      }
      hospitalizationsNew {
        errorCode
        errorMsg
        errorType
        response {
          authToken
          userId
          id
          fileUrl
          date
          hospitalizationDate
          dateOfHospitalization
          hospitalName
          doctorName
          reasonForAdmission
          diagnosisNotes
          dateOfDischarge
          dischargeSummary
          doctorInstruction
          dateOfNextVisit
          hospitalizationFiles {
            id
            fileName
            mimeType
            content
            byteContent
            dateCreated
          }
          source
        }
      }
    }
  }
`;

export const GET_LAB_RESULT_PDF = gql`
  query getLabResultpdf($patientId: ID!, $recordId: String!) {
    getLabResultpdf(patientId: $patientId, recordId: $recordId) {
      url
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
          doctorHospital {
            facility {
              id
              name
            }
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
          chatDays
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
        # queueCount
      }
      totalJuniorDoctors
      isJdAllowed
      isJdAssigned
    }
  }
`;

export const CHECK_IF_FOLLOWUP_BOOKED = gql`
  query checkIfFollowUpBooked($appointmentId: String!) {
    checkIfFollowUpBooked(appointmentId: $appointmentId)
  }
`;

export const SEND_PATIENT_WAIT_NOTIFICATION = gql`
  query sendPatientWaitNotification($appointmentId: String!) {
    sendPatientWaitNotification(appointmentId: $appointmentId) {
      status
    }
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

export const ADD_CHAT_DOCUMENTS = gql`
  mutation addChatDocument($appointmentId: ID!, $documentPath: String, $prismFileId: String) {
    addChatDocument(
      appointmentId: $appointmentId
      documentPath: $documentPath
      prismFileId: $prismFileId
    ) {
      id
      documentPath
      prismFileId
    }
  }
`;

export const CANCEL_MEDICINE_ORDER_OMS = gql`
  mutation CancelMedicineOrderOMS($medicineOrderCancelOMSInput: MedicineOrderCancelOMSInput) {
    cancelMedicineOrderOMS(medicineOrderCancelOMSInput: $medicineOrderCancelOMSInput) {
      orderStatus
    }
  }
`;

export const ALERT_MEDICINE_ORDER_PICKUP = gql`
  mutation alertMedicineOrderPickup($alertMedicineOrderPickupInput: AlertMedicineOrderPickupInput) {
    alertMedicineOrderPickup(alertMedicineOrderPickupInput: $alertMedicineOrderPickupInput) {
      status
      message
    }
  }
`;

export const GET_MEDICINE_ORDER_CANCEL_REASONS = gql`
  query GetMedicineOrderCancelReasons {
    getMedicineOrderCancelReasons {
      cancellationReasons {
        reasonCode
        description
        displayMessage
        isUserReason
      }
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
        testDescription
        testPreparationData
        diagnosticPricing {
          mrp
          price
          groupPlan
          status
          startDate
          endDate
        }
      }
    }
  }
`;

export const SEARCH_DIAGNOSTICS_BY_CITY_ID = gql`
  query searchDiagnosticsByCityID($cityID: Int!, $searchText: String!) {
    searchDiagnosticsByCityID(cityID: $cityID, searchText: $searchText) {
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
        testDescription
        testPreparationData
        diagnosticPricing {
          mrp
          price
          groupPlan
          status
          startDate
          endDate
        }
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
        testDescription
        testPreparationData
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

export const SAVE_DIAGNOSTIC_HOME_COLLECTION_ORDER = gql`
  mutation DiagnosticBookHomeCollection($diagnosticOrderInput: DiagnosticBookHomeCollectionInput) {
    DiagnosticBookHomeCollection(diagnosticOrderInput: $diagnosticOrderInput) {
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

export const UPLOAD_MEDIA_DOCUMENT_PRISM = gql`
  mutation uploadMediaDocument(
    $MediaPrescriptionUploadRequest: MediaPrescriptionUploadRequest
    $uhid: String!
    $appointmentId: ID!
  ) {
    uploadMediaDocument(
      prescriptionInput: $MediaPrescriptionUploadRequest
      uhid: $uhid
      appointmentId: $appointmentId
    ) {
      recordId
      fileUrl
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
        # queueCount
      }
      totalJuniorDoctors
      isJdAllowed
      isJdAssigned
    }
  }
`;

export const LOGIN = gql`
  query Login($mobileNumber: String!, $loginType: LOGIN_TYPE!, $hashCode: String) {
    login(mobileNumber: $mobileNumber, loginType: $loginType, hashCode: $hashCode) {
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
        athsToken
        referralCode
        isLinked
        isUhidPrimary
        primaryUhid
        primaryPatientId
        whatsAppMedicine
        whatsAppConsult
        isLinked
        isUhidPrimary
        primaryUhid
        primaryPatientId
        partnerId
      }
    }
  }
`;

export const GET_PATIENTS_MOBILE_WITH_HISTORY = gql`
  query getPatientByMobileNumberWithHistory($mobileNumber: String) {
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
        athsToken
        referralCode
        isLinked
        isUhidPrimary
        primaryUhid
        primaryPatientId
        whatsAppMedicine
        whatsAppConsult
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
        isLinked
        isUhidPrimary
        primaryUhid
        primaryPatientId
        partnerId
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
        paymentRefId
        displayId
        bankTxnId
        paymentStatus
        amountPaid
        amountBreakup {
          actual_price
          slashed_price
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
      orderDateTime
      paymentMode
    }
  }
`;

export const CONSULT_ORDER_PAYMENT_DETAILS = gql`
  query consultOrders($patientId: String!, $pageNo: Int!, $pageSize: Int!) {
    consultOrders(patientId: $patientId, pageNo: $pageNo, pageSize: $pageSize) {
      meta {
        pageNo
        pageSize
        total
      }
      appointments {
        id
        doctorId
        displayId
        appointmentDateTime
        actualAmount
        status
        appointmentType
        discountedAmount
        appointmentRefunds {
          refundAmount
          txnTimestamp
          refundStatus
        }
        appointmentPayments {
          paymentRefId
          paymentStatus
          amountPaid
        }
        doctor {
          name
        }
      }
    }
  }
`;

export const PHARMACY_ORDER_PAYMENT_DETAILS = gql`
  query pharmacyOrders($patientId: String!, $pageNo: Int!, $pageSize: Int!) {
    pharmacyOrders(patientId: $patientId, pageNo: $pageNo, pageSize: $pageSize) {
      meta {
        pageNo
        pageSize
        total
      }
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
          paymentMode
          amountPaid
          healthCreditsRedeemed
          refundAmount
          medicineOrderRefunds {
            refundAmount
            createdDate
            refundStatus
            refundId
            txnId
          }
        }
      }
    }
  }
`;

export const CONSULT_ORDER_INVOICE = gql`
  query getOrderInvoice($patientId: String!, $appointmentId: String!, $emailId: Email) {
    getOrderInvoice(patientId: $patientId, appointmentId: $appointmentId, emailId: $emailId)
  }
`;

export const LINK_UHID = gql`
  mutation linkUhids($primaryUhid: String!, $linkedUhids: [String]) {
    linkUhids(primaryUhid: $primaryUhid, linkedUhids: $linkedUhids)
  }
`;

export const UNLINK_UHID = gql`
  mutation unlinkUhids($primaryUhid: String!, $unlinkUhids: [String]) {
    unlinkUhids(primaryUhid: $primaryUhid, unlinkUhids: $unlinkUhids)
  }
`;

export const GET_ONEAPOLLO_USER = gql`
  query getOneApolloUser($patientId: String!) {
    getOneApolloUser(patientId: $patientId) {
      name
      earnedHC
      availableHC
      tier
      burnedCredits
      blockedCredits
    }
  }
`;

export const GET_ONEAPOLLO_USERTXNS = gql`
  query getOneApolloUserTransactions {
    getOneApolloUserTransactions {
      earnedHC
      transactionDate
      grossAmount
      netAmount
      transactionDate
      businessUnit
      redeemedHC
    }
  }
`;

export const UPDATE_WHATSAPP_STATUS = gql`
  mutation updateWhatsAppStatus(
    $whatsAppMedicine: Boolean
    $whatsAppConsult: Boolean
    $patientId: String!
  ) {
    updateWhatsAppStatus(
      whatsAppMedicine: $whatsAppMedicine
      whatsAppConsult: $whatsAppConsult
      patientId: $patientId
    ) {
      status
    }
  }
`;

export const UPDATE_SAVE_EXTERNAL_CONNECT = gql`
  mutation updateSaveExternalConnect(
    $doctorId: String!
    $patientId: String!
    $externalConnect: Boolean
    $appointmentId: String!
  ) {
    updateSaveExternalConnect(
      doctorId: $doctorId
      patientId: $patientId
      externalConnect: $externalConnect
      appointmentId: $appointmentId
    ) {
      status
    }
  }
`;

export const GET_PERSONALIZED_APPOITNMENTS = gql`
  query getPatientPersonalizedAppointments($patientUhid: String!) {
    getPatientPersonalizedAppointments(patientUhid: $patientUhid) {
      appointmentDetails {
        id
        hospitalLocation
        appointmentDateTime
        appointmentType
        doctorId
        doctorDetails {
          id
          firstName
          experience
          photoUrl
          displayName
          specialty {
            id
            name
            userFriendlyNomenclature
          }
        }
      }
    }
  }
`;

export const GET_APPOINTMENT_RESCHEDULE_DETAILS = gql`
  query getAppointmentRescheduleDetails($appointmentId: String!) {
    getAppointmentRescheduleDetails(appointmentId: $appointmentId) {
      id
      rescheduledDateTime
      rescheduleReason
      rescheduleInitiatedBy
      rescheduleInitiatedId
      rescheduleStatus
    }
  }
`;

export const SAVE_VOIP_DEVICE_TOKEN = gql`
  mutation addVoipPushToken($voipPushTokenInput: voipPushTokenInput!) {
    addVoipPushToken(voipPushTokenInput: $voipPushTokenInput) {
      isError
      response
      patientId
      voipToken
    }
  }
`;

export const GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS = gql`
  query GetAllUserSubscriptionsWithPlanBenefits($mobile_number: String!) {
    GetAllUserSubscriptionsWithPlanBenefits(mobile_number: $mobile_number) {
      code
      success
      message
      response
    }
  }
`;

export const IDENTIFY_HDFC_CUSTOMER = gql`
  query identifyHdfcCustomer($mobileNumber: String!, $DOB: Date!) {
    identifyHdfcCustomer(mobileNumber: $mobileNumber, DOB: $DOB) {
      status
      token
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

export const VALIDATE_HDFC_OTP = gql`
  query validateHdfcOTP($otp: String!, $token: String!, $dateOfBirth: Date!) {
    validateHdfcOTP(otp: $otp, token: $token, dateOfBirth: $dateOfBirth) {
      status
      defaultPlan
    }
  }
`;

export const GET_PARTICIPANTS_LIVE_STATUS = gql`
  query setAndGetNumberOfParticipants(
    $appointmentId: String
    $userType: USER_TYPE
    $sourceType: BOOKINGSOURCE
    $deviceType: DEVICETYPE
    $userStatus: USER_STATUS
  ) {
    setAndGetNumberOfParticipants(
      appointmentId: $appointmentId
      userType: $userType
      sourceType: $sourceType
      deviceType: $deviceType
      userStatus: $userStatus
    ) {
      NUMBER_OF_PARTIPANTS
    }
  }
`;

export const CREATE_USER_SUBSCRIPTION = gql`
  mutation CreateUserSubscription($userSubscription: CreateUserSubscriptionInput!) {
    CreateUserSubscription(UserSubscription: $userSubscription) {
      code
      success
      message
      response {
        mobile_number
        status
        start_date
        end_date
        group_plan {
          name
          plan_id
        }
      }
    }
  }
`;

export const CREATE_ONE_APOLLO_USER = gql`
  mutation createOneApolloUser($patientId: String!) {
    createOneApolloUser(patientId: $patientId) {
      success
      message
    }
  }
`;
export const GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES = gql`
  query getPincodeServiceability($pincode: Int!) {
    getPincodeServiceability(pincode: $pincode) {
      cityID
      cityName
      stateID
      stateName
    }
  }
`;

export const GET_ALL_GROUP_BANNERS_OF_USER = gql`
  query GetAllGroupBannersOfUser($mobile_number: String!) {
    GetAllGroupBannersOfUser(mobile_number: $mobile_number) {
      code
      success
      message
      response {
        _id
        is_active
        banner
        banner_template_info
        cta_action
        meta
      }
    }
  }
`;

export const UPDATE_HEALTH_RECORD_NUDGE_STATUS = gql`
  mutation updateHealthRecordNudgeStatus($appointmentId: String!, $hideHealthRecordNudge: Boolean) {
    updateHealthRecordNudgeStatus(
      appointmentId: $appointmentId
      hideHealthRecordNudge: $hideHealthRecordNudge
    ) {
      response
    }
  }
`;

export const SET_DEFAULT_ADDRESS = gql`
  mutation makeAdressAsDefault($patientAddressId: ID!) {
    makeAdressAsDefault(patientAddressId: $patientAddressId) {
      patientAddress {
        id
        defaultAddress
      }
    }
  }
`;

export const GET_DOCTOR_LIST = gql`
  query getDoctorList($filterInput: FilterDoctorInput) {
    getDoctorList(filterInput: $filterInput) {
      doctors
      specialties {
        id
        name
        specialtydisplayName
        image
        shortDescription
        symptoms
      }
      apolloDoctorCount
      partnerDoctorCount
    }
  }
`;

export const GET_DIAGNOSTIC_AREAS = gql`
  query getAreas($pincode: Int!, $itemIDs: [Int]!) {
    getAreas(pincode: $pincode, itemIDs: $itemIDs) {
      status
      areas {
        id
        area
      }
    }
  }
`;

export const GET_DOCTORLIST_FILTERS = gql`
  query getDoctorListFilters {
    getDoctorListFilters {
      filters {
        city {
          state
          data
        }
        brands {
          name
          image
          brandName
        }
        language {
          name
        }
        experience {
          name
        }
        availability {
          name
        }
        fee {
          name
        }
        gender {
          name
        }
      }
    }
  }
`;

export const GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID = gql`
  query getDiagnosticSlotsWithAreaID($selectedDate: Date!, $areaID: Int!) {
    getDiagnosticSlotsWithAreaID(selectedDate: $selectedDate, areaID: $areaID) {
      slots {
        Timeslot
        TimeslotID
      }
    }
  }
`;

export const GET_CASHBACK_DETAILS_OF_PLAN_ID = gql`
  query GetCashbackDetailsOfPlanById($plan_id: String!) {
    GetCashbackDetailsOfPlanById(plan_id: $plan_id) {
      code
      success
      message
      response
    }
  }
`;

export const GET_PLAN_DETAILS_BY_PLAN_ID = gql`
  query GetPlanDetailsByPlanId($plan_id: String!) {
    GetPlanDetailsByPlanId(plan_id: $plan_id) {
      response {
        _id
        name
        plan_id
        plan_summary
      }
    }
  }
`;

export const GET_SUBSCRIPTIONS_OF_USER_BY_STATUS = gql`
  query GetSubscriptionsOfUserByStatus($mobile_number: String!, $status: [String!]!) {
    GetSubscriptionsOfUserByStatus(mobile_number: $mobile_number, status: $status) {
      code
      success
      message
      response
    }
  }
`;

export const GET_CIRCLE_SAVINGS_OF_USER_BY_MOBILE = gql`
  query GetCircleSavingsOfUserByMobile($mobile_number: String!) {
    GetCircleSavingsOfUserByMobile(mobile_number: $mobile_number) {
      code
      success
      message
      response
    }
  }
`;
