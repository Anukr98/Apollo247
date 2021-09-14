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
        familyHistory {
          description
          relation
        }
        lifeStyle {
          description
          occupationHistory
        }
        patientMedicalHistory {
          bp
          dietAllergies
          drugAllergies
          height
          menstrualHistory
          pastMedicalHistory
          pastSurgicalHistory
          temperature
          bloodGroup
          weight
        }
      }
    }
  }
`;

export const UPDATE_PATIENT_MEDICAL_PARAMETERS = gql`
  mutation updatePatientMedicalParameters($patientMedicalParameters: PatientMedicalParameters) {
    updatePatientMedicalParameters(patientMedicalParameters: $patientMedicalParameters) {
      patient {
        id
        patientMedicalHistory {
          bloodGroup
          height
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

export const INITIATE_CALL_FOR_PARTNER = gql`
  query initiateCallForPartner(
    $mobileNumber: String!
    $benefitId: String!
    $userSubscriptionId: String
  ) {
    initiateCallForPartner(
      mobileNumber: $mobileNumber
      benefitId: $benefitId
      userSubscriptionId: $userSubscriptionId
    ) {
      success
    }
  }
`;

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
        paymentOrderId
      }
    }
  }
`;

export const BOOK_APPOINTMENT_WITH_SUBSCRIPTION = gql`
  mutation bookAppointmentwithSubscription(
    $bookAppointment: BookAppointmentInput!
    $userSubscription: CreateUserSubscriptionInput!
  ) {
    bookAppointment(appointmentInput: $bookAppointment) {
      appointment {
        id
        doctorId
        appointmentDateTime
        status
        appointmentType
        patientId
        displayId
        paymentOrderId
      }
    }
    CreateUserSubscription(UserSubscription: $userSubscription) {
      code
      success
      message
      response {
        _id
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

export const MAKE_APPOINTMENT_PAYMENT = gql`
  mutation makeAppointmentPaymentV2($paymentInput: AppointmentPaymentInputV2) {
    makeAppointmentPaymentV2(paymentInput: $paymentInput) {
      appointment {
        id
      }
    }
  }
`;

export const RETURN_PHARMA_ORDER = gql`
  mutation returnPharmaOrder($returnPharmaOrderInput: ReturnPharmaOrderInput) {
    returnPharmaOrder(returnPharmaOrderInput: $returnPharmaOrderInput) {
      status
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
      specialty
      symptoms
      allowBookingRequest
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
      slotCounts {
        date
        slotCount
      }
    }
  }
`;

export const GET_PATIENT_FUTURE_APPOINTMENT_COUNT = gql`
  query getPatientFutureAppointmentCount($patientId: String) {
    getPatientFutureAppointmentCount(patientId: $patientId) {
      activeConsultsCount
      upcomingConsultsCount
      upcomingPhysicalConsultsCount
    }
  }
`;

export const GET_IMMUNIZATION_DETAILS = gql`
  mutation addPatientImmunizationRecord($addImmunizationRecordInput: AddImmunizationRecordInput) {
    addPatientImmunizationRecord(addImmunizationRecordInput: $addImmunizationRecordInput) {
      status
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

export const GET_PATIENT_ALL_APPOINTMENTS_FOR_HELP = gql`
  query GetPatientAllAppointmentsForHelp($patientId: String!) {
    getPatientAllAppointments(patientId: $patientId) {
      appointments {
        actualAmount
        appointmentType
        appointmentDateTime
        displayId
        doctorInfo {
          thumbnailUrl
          displayName
          experience
          specialty {
            name
          }
          doctorHospital {
            facility {
              name
              city
            }
          }
        }
      }
    }
  }
`;

export const GET_PATIENT_ALL_APPOINTMENTS = gql`
  query getPatientAllAppointments(
    $patientId: String!
    $patientMobile: String!
    $offset: Int!
    $limit: Int!
  ) {
    getPatientAllAppointments(
      patientId: $patientId
      patientMobile: $patientMobile
      offset: $offset
      limit: $limit
    ) {
      totalAppointmentCount
      appointments {
        patientName
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
        discountedAmount
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
        isAutomatedQuestionsComplete
        symptoms
        doctorInfo {
          allowBookingRequest
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
          id
          followUpAfterInDays
          version
          doctorType
          sentToPatient
          medicinePrescription {
            id
            medicineName
            medicineUnit
            medicineTimings
            medicineDosage
            medicineCustomDosage
            medicineConsumptionDurationInDays
            medicineConsumptionDurationUnit
          }
          diagnosticPrescription {
            itemname
            testInstruction
          }
          blobName
        }
      }
    }
  }
`;

export const GET_PATIENT_ALL_CONSULTED_DOCTORS = gql`
  query getPatientAllConsultedDoctors($patientId: String!) {
    getPatientAllAppointments(patientId: $patientId) {
      appointments {
        doctorInfo {
          id
          displayName
          specialty {
            image
            name
          }
          photoUrl
        }
        id
        hideHealthRecordNudge
        discountedAmount
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
        isAutomatedQuestionsComplete
        symptoms
        doctorInfo {
          allowBookingRequest
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
          id
          followUpAfterInDays
          version
          doctorType
          medicinePrescription {
            id
            medicineName
            medicineUnit
            medicineTimings
            medicineDosage
            medicineCustomDosage
            medicineConsumptionDurationInDays
            medicineConsumptionDurationUnit
          }
          diagnosticPrescription {
            itemname
            testInstruction
          }
          blobName
        }
      }
      activeAppointments {
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
        discountedAmount
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
        isAutomatedQuestionsComplete
        symptoms
        doctorInfo {
          allowBookingRequest
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
          id
          followUpAfterInDays
          version
          doctorType
          medicinePrescription {
            id
            medicineName
            medicineUnit
            medicineTimings
            medicineDosage
            medicineCustomDosage
            medicineConsumptionDurationInDays
            medicineConsumptionDurationUnit
          }
          diagnosticPrescription {
            itemname
            testInstruction
          }
          blobName
        }
      }
      completedAppointments {
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
        discountedAmount
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
        isAutomatedQuestionsComplete
        symptoms
        doctorInfo {
          allowBookingRequest
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
          id
          followUpAfterInDays
          version
          doctorType
          medicinePrescription {
            id
            medicineName
            medicineUnit
            medicineTimings
            medicineDosage
            medicineCustomDosage
            medicineConsumptionDurationInDays
            medicineConsumptionDurationUnit
          }
          diagnosticPrescription {
            itemname
            testInstruction
          }
          blobName
        }
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
      slugName
      userFriendlyNomenclature
      # displayOrder
      shortDescription
      symptoms
    }
  }
`;

export const ADD_PRESCRIPTION_RECORD = gql`
  mutation addPatientPrescriptionRecord($AddPrescriptionRecordInput: AddPrescriptionRecordInput) {
    addPatientPrescriptionRecord(addPrescriptionRecordInput: $AddPrescriptionRecordInput) {
      status
    }
  }
`;

export const GET_DOCTOR_DETAILS_BY_ID = gql`
  query getDoctorDetailsById($id: String!) {
    getDoctorDetailsById(id: $id) {
      id
      skipAutoQuestions
      isJdAllowed
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
      gender
      profile_deeplink
      photoUrl
      availableModes
      doctorPricing {
        slashed_price
        available_to
        status
        mrp
        appointment_type
        slashed_price
        is_cashback_enabled
        cashback_amount
        bookingFee
        isBookingFeeExempted
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
      doctorCardActiveCTA {
        ONLINE
        PHYSICAL
        DEFAULT
      }
    }
  }
`;

export const GET_PLATINUM_DOCTOR = gql`
  query getPlatinumDoctor(
    $specialtyId: ID
    $zoneType: ZoneType
    $zone: String
    $partnerDoctor: Boolean
  ) {
    getPlatinumDoctor(
      specialtyId: $specialtyId
      zoneType: $zoneType
      zone: $zone
      partnerDoctor: $partnerDoctor
    ) {
      doctors {
        id
        displayName
        doctorType
        consultMode
        earliestSlotInMinutes
        doctorfacility
        fee
        specialistPluralTerm
        languages
        specialistPluralTerm
        specialtydisplayName
        doctorType
        qualification
        experience
        photoUrl
        profile_deeplink
        slot
        thumbnailUrl
        availabilityTitle {
          AVAILABLE_NOW
          CONSULT_NOW
          DOCTOR_OF_HOUR
        }
        doctorPricing {
          slashed_price
          available_to
          status
          mrp
          appointment_type
        }
        doctorCardActiveCTA {
          ONLINE
          PHYSICAL
          DEFAULT
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
      slotCounts {
        date
        slotCount
      }
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
        defaultAddress
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

export const CALL_CONNECTION_UPDATES = gql`
  mutation checkCallConnection($CheckCallConnectionInput: CheckCallConnectionInput!) {
    checkCallConnection(checkCallConnectionInput: $CheckCallConnectionInput) {
      success
    }
  }
`;

export const UPDATE_PATIENT_APP_VERSION = gql`
  mutation UpdatePatientAppVersion(
    $patientId: String!
    $appVersion: String!
    $osType: DEVICETYPE
    $appsflyerId: String
  ) {
    updatePatientAppVersion(
      patientId: $patientId
      appVersion: $appVersion
      osType: $osType
      appsflyerId: $appsflyerId
    ) {
      status
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
        urlKey
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

export const SAVE_MEDICINE_ORDER_OMS_V2 = gql`
  mutation saveMedicineOrderV2($medicineOrderInput: SaveMedicineOrderV2Input!) {
    saveMedicineOrderV2(medicineOrderInput: $medicineOrderInput) {
      errorCode
      errorMessage
      transactionId
      isCodEligible
      codMessage
      orders {
        id
        orderAutoId
        estimatedAmount
      }
    }
  }
`;

export const SAVE_ORDER_WITH_SUBSCRIPTION = gql`
  mutation saveOrderWithSubscription(
    $medicineOrderInput: SaveMedicineOrderV2Input!
    $userSubscription: CreateUserSubscriptionInput!
  ) {
    saveMedicineOrderV2(medicineOrderInput: $medicineOrderInput) {
      errorCode
      errorMessage
      transactionId
      isCodEligible
      codMessage
      orders {
        id
        orderAutoId
        estimatedAmount
      }
    }
    CreateUserSubscription(UserSubscription: $userSubscription) {
      code
      success
      message
      response {
        _id
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

export const SAVE_PICKUP_ORDER_WITH_SUBSCRIPTION = gql`
  mutation savePickUpOrderWithSubscription(
    $medicineCartOMSInput: MedicineCartOMSInput!
    $userSubscription: CreateUserSubscriptionInput!
  ) {
    saveMedicineOrderOMS(medicineCartOMSInput: $medicineCartOMSInput) {
      errorCode
      errorMessage
      orderId
      orderAutoId
    }
    CreateUserSubscription(UserSubscription: $userSubscription) {
      code
      success
      message
      response {
        _id
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

export const UPDATE_MEDICINE_ORDER_SUBSTITUTION = gql`
  mutation updateMedicineOrderSubstitution(
    $transactionId: Int
    $orderId: Int
    $substitution: String
  ) {
    updateMedicineOrderSubstitution(
      transactionId: $transactionId
      orderId: $orderId
      substitution: $substitution
    ) {
      message
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

export const SAVE_MEDICINE_ORDER_PAYMENT_V2 = gql`
  mutation saveMedicineOrderPaymentMqV2($medicinePaymentMqInput: MedicinePaymentMqV2Input!) {
    saveMedicineOrderPaymentMqV2(medicinePaymentMqInput: $medicinePaymentMqInput) {
      errorCode
      errorMessage
      paymentOrderId
      orderStatus
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
          statusDate
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

export const GET_PACKAGE_INCLUSIONS = gql`
  query getInclusionsOfMultipleItems($itemID: [Int]!) {
    getInclusionsOfMultipleItems(itemID: $itemID) {
      inclusions {
        itemId
        requiredAttachment
        sampleRemarks
        sampleTypeName
        testParameters
        name
        testPreparationData
      }
    }
  }
`;

export const GET_DIAGNOSTIC_ORDER_LIST_DETAILS = gql`
  query getDiagnosticOrderDetails($diagnosticOrderId: String) {
    getDiagnosticOrderDetails(diagnosticOrderId: $diagnosticOrderId) {
      ordersList {
        id
        patientId
        patientAddressId
        patientObj {
          firstName
          lastName
          gender
        }
        patientAddressObj {
          addressLine1
          addressLine2
          addressType
          landmark
          state
          city
          zipcode
          latitude
          longitude
        }
        slotTimings
        slotId
        totalPrice
        attributesObj {
          slotDurationInMinutes
          expectedReportGenerationTime
          reportTATMessage
        }
        prescriptionUrl
        diagnosticDate
        orderStatus
        orderType
        displayId
        createdDate
        collectionCharges
        slotDateTimeInUTC
        paymentType
        visitNo
        invoiceURL
        labReportURL
        diagnosticOrderLineItems {
          id
          itemId
          itemName
          itemType
          price
          quantity
          groupPlan
          editOrderID
          isRemoved
          itemObj {
            itemType
            testPreparationData
            packageCalculatedMrp
            inclusions
            reportGenerationTime
          }
          pricingObj {
            mrp
            price
            groupPlan
          }
          diagnostics {
            id
            itemName
            itemId
            gender
            rate
            itemRemarks
            city
            state
            itemType
            fromAgeInDays
            collectionType
            testDescription
            testPreparationData
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
  query findDiagnosticsByItemIDsAndCityID($cityID: Int!, $itemIDs: [Int]!, $pincode: Int) {
    findDiagnosticsByItemIDsAndCityID(cityID: $cityID, itemIDs: $itemIDs, pincode: $pincode) {
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
        packageCalculatedMrp
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
`;

export const GET_WIDGETS_PRICING_BY_ITEMID_CITYID = gql`
  query findDiagnosticsWidgetsPricing($cityID: Int!, $itemIDs: [Int]!) {
    findDiagnosticsWidgetsPricing(cityID: $cityID, itemIDs: $itemIDs) {
      diagnostics {
        itemId
        packageCalculatedMrp
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
  mutation cancelDiagnosticsOrder($cancellationDiagnosticsInput: CancellationDiagnosticsInput) {
    cancelDiagnosticsOrder(cancellationDiagnosticsInput: $cancellationDiagnosticsInput) {
      status
      message
    }
  }
`;

export const RESCHEDULE_DIAGNOSTIC_ORDER = gql`
  mutation rescheduleDiagnosticsOrder($rescheduleDiagnosticsInput: RescheduleDiagnosticsInput) {
    rescheduleDiagnosticsOrder(rescheduleDiagnosticsInput: $rescheduleDiagnosticsInput) {
      status
      rescheduleCount
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
        appointmentId
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
        totalCashBack
        consultInfo {
          doctorName
          appointmentDateTime
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
          driverDetails {
            driverName
            driverPhone
          }
          id
          siteId
          siteName
          trackingNo
          trackingProvider
          updatedDate
          currentStatus
          itemDetails
          trackingUrl
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
export const GET_DIAGNOSTIC_ORDERS_LIST_BY_MOBILE = gql`
  query getDiagnosticOrdersListByMobile(
    $mobileNumber: String
    $paginated: Boolean
    $limit: Int
    $offset: Int
  ) {
    getDiagnosticOrdersListByMobile(
      mobileNumber: $mobileNumber
      offset: $offset
      limit: $limit
      paginated: $paginated
    ) {
      ordersList {
        id
        isRescheduled
        rescheduleCount
        areaId
        cityId
        patientId
        orderType
        totalPrice
        orderStatus
        createdDate
        paymentType
        diagnosticDate
        paymentOrderId
        patientAddressId
        displayId
        diagnosticDate
        visitNo
        labReportURL
        slotTimings
        slotId
        slotDateTimeInUTC
        collectionCharges
        patientObj {
          id
          uhid
          firstName
          lastName
          gender
          dateOfBirth
        }
        attributesObj {
          preTestingRequirement
          reportGenerationTime
          initialCollectionCharges
          slotDurationInMinutes
          expectedReportGenerationTime
          reportTATMessage
        }
        patientAddressObj {
          addressLine1
          addressLine2
          addressType
          landmark
          state
          city
          zipcode
          latitude
          longitude
        }
        diagnosticOrdersStatus {
          id
          orderStatus
          statusDate
          itemId
          packageId
          itemName
          packageName
          hideStatus
          statusMessage
        }
        diagnosticOrderLineItems {
          id
          itemId
          quantity
          itemName
          groupPlan
          price
          itemType
          editOrderID
          isRemoved
          itemObj {
            itemType
            testPreparationData
            packageCalculatedMrp
            inclusions
            reportGenerationTime
          }
          diagnostics {
            id
            itemId
            itemName
            itemType
            toAgeInDays
            canonicalTag
            fromAgeInDays
            testDescription
            inclusions
            testPreparationData
            diagnosticPricing {
              status
              endDate
              groupPlan
              startDate
            }
          }
          testPreparationData
          packageCalculatedMrp
        }
        phleboDetailsObj {
          PhelboOTP
          PhelbotomistName
          PhelbotomistMobile
          PhelbotomistTrackLink
          TempRecording
          CheckInTime
          PhleboLatitude
          PhleboLongitude
        }
        diagnosticOrderPhlebotomists {
          phleboRating
          phleboOTP
          checkinDateTime
          phleboTrackLink
          diagnosticPhlebotomists {
            id
            name
            mobile
            vaccinationStatus
          }
        }
        diagnosticOrderReschedule {
          rescheduleDate
          rescheduleReason
          comments
          rescheduleDate
          rescheduleReason
          rescheduleDateTimeInUTC
        }
        diagnosticOrderCancellation {
          cancellationReason
          cancelType
          cancelByName
          comments
        }
      }
      ordersCount
      membersDetails {
        id
        firstName
        lastName
      }
    }
  }
`;
export const GET_MEDICINE_ORDER_OMS_DETAILS_SHIPMENT = gql`
  query GetMedicineOrderShipmentDetails(
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
        medicineOrderShipments {
          trackingNo
          trackingProvider
        }
      }
    }
  }
`;

export const PHR_COVERT_TO_ZIP = gql`
  mutation convertToZip($fileUrls: [String]!, $uhid: String!) {
    convertToZip(fileUrls: $fileUrls, uhid: $uhid) {
      zipUrl
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

export const MERGE_PDF = gql`
  mutation mergePDFS($uhid: String!, $fileUrls: [String]!) {
    mergePDFS(fileUrls: $fileUrls, uhid: $uhid) {
      mergepdfUrl
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

export const GET_HELP_SECTION_QUERIES = gql`
  query GetHelpSectionQueries {
    getHelpSectionQueries {
      needHelpQueries {
        id
        title
        nonOrderQueries
        queriesByOrderStatus
        content {
          title
          text
          cta {
            title
            appRoute
            webRoute
            appRouteParams
            webRouteParams
          }
          ctaNonCircle {
            title
            appRoute
            webRoute
            appRouteParams
            webRouteParams
          }
          ctaCircle {
            title
            appRoute
            webRoute
            appRouteParams
            webRouteParams
          }
        }
        queries {
          id
          title
          nonOrderQueries
          queriesByOrderStatus
          content {
            title
            text
            cta {
              title
              appRoute
              webRoute
              appRouteParams
              webRouteParams
            }
            ctaNonCircle {
              title
              appRoute
              webRoute
              appRouteParams
              webRouteParams
            }
            ctaCircle {
              title
              appRoute
              webRoute
              appRouteParams
              webRouteParams
            }
          }
          queries {
            id
            title
            nonOrderQueries
            queriesByOrderStatus
            content {
              title
              text
              cta {
                title
                appRoute
                webRoute
                appRouteParams
                webRouteParams
              }
              ctaNonCircle {
                title
                appRoute
                webRoute
                appRouteParams
                webRouteParams
              }
              ctaCircle {
                title
                appRoute
                webRoute
                appRouteParams
                webRouteParams
              }
            }
            queries {
              id
              title
              nonOrderQueries
              queriesByOrderStatus
              content {
                title
                text
                cta {
                  title
                  appRoute
                  webRoute
                  appRouteParams
                  webRouteParams
                }
                ctaNonCircle {
                  title
                  appRoute
                  webRoute
                  appRouteParams
                  webRouteParams
                }
                ctaCircle {
                  title
                  appRoute
                  webRoute
                  appRouteParams
                  webRouteParams
                }
              }
              queries {
                id
                title
                nonOrderQueries
                queriesByOrderStatus
              }
            }
          }
        }
      }
    }
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

export const GET_PRISM_AUTH_TOKEN = gql`
  query getPrismAuthToken($uhid: String!) {
    getPrismAuthToken(uhid: $uhid) {
      errorCode
      errorMsg
      errorType
      response
    }
  }
`;

export const GET_PRESCRIPTIONS_BY_MOBILE_NUMBER = gql`
  query getPrescriptionsByMobileNumber(
    $MobileNumber: String!
    $recordId: String!
    $source: String!
    $records: [MedicalRecordType]!
  ) {
    getPrescriptionsByMobileNumber(
      MobileNumber: $MobileNumber
      recordId: $recordId
      source: $source
      records: $records
    ) {
      patientId
      test_report {
        response {
          id
          labTestName
          labTestSource
          packageId
          packageName
          labTestDate
          date
          labTestRefferedBy
          siteDisplayName
          tag
          consultId
          identifier
          additionalNotes
          observation
          labTestResults {
            parameterName
            unit
            result
            range
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
      prescription {
        response {
          id
          prescriptionName
          date
          prescribedBy
          notes
          prescriptionSource
          siteDisplayName
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
    }
  }
`;

export const GET_PAST_CONSULTS_PRESCRIPTIONS_BY_MOBILE = gql`
  query getLinkedProfilesPastConsultsAndPrescriptionsByMobile(
    $consultsAndOrdersByMobileInput: PatientConsultsAndOrdersByMobileInput
  ) {
    getLinkedProfilesPastConsultsAndPrescriptionsByMobile(
      consultsAndOrdersByMobileInput: $consultsAndOrdersByMobileInput
    ) {
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

export const GET_MEDICAL_PRISM_RECORD_V2 = gql`
  query getPatientPrismMedicalRecords_V2($patientId: ID!, $records: [MedicalRecordType]) {
    getPatientPrismMedicalRecords_V2(patientId: $patientId, records: $records) {
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
          identifier
          additionalNotes
          billNo
          testSequence
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
            index
            file_Url
            # content
            # byteContent
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
          siteDisplayName
          source
          fileUrl
          prescriptionFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
          }
          hospital_name
          hospitalId
        }
        errorCode
        errorMsg
        errorType
      }
      healthChecks {
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
          siteDisplayName
          healthCheckSummary
          healthCheckFiles {
            id
            fileName
            mimeType
            content
            # byteContent
            # dateCreated
          }
          source
          healthCheckType
          followupDate
        }
      }
      hospitalizations {
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
          siteDisplayName
          diagnosisNotes
          dateOfDischarge
          dischargeSummary
          doctorInstruction
          dateOfNextVisit
          hospitalizationFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
          source
        }
      }
      medicalBills {
        errorCode
        errorMsg
        errorType
        response {
          id
          bill_no
          hospitalName
          billDate
          source
          siteDisplayName
          notes
          fileUrl
          billDateTime
          billFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      medicalInsurances {
        errorCode
        errorMsg
        errorType
        response {
          id
          insuranceCompany
          policyNumber
          startDate
          endDate
          startDateTime
          endDateTime
          source
          siteDisplayName
          fileUrl
          notes
          sumInsured
          insuranceFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      medicalConditions {
        errorCode
        errorMsg
        errorType
        response {
          id
          medicalConditionName
          doctorTreated
          startDate
          source
          endDate
          notes
          illnessType
          fileUrl
          siteDisplayName
          startDateTime
          endDateTime
          medicationFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      medications {
        errorCode
        errorMsg
        errorType
        response {
          id
          medicineName
          medicalCondition
          doctorName
          startDate
          endDate
          startDateTime
          endDateTime
          morning
          noon
          siteDisplayName
          evening
          notes
          source
        }
      }
      healthRestrictions {
        errorCode
        errorMsg
        errorType
        response {
          id
          startDate
          endDate
          startDateTime
          endDateTime
          restrictionName
          suggestedByDoctor
          nature
          siteDisplayName
          source
          notes
        }
      }
      allergies {
        errorCode
        errorMsg
        errorType
        response {
          id
          startDate
          endDate
          fileUrl
          startDateTime
          endDateTime
          allergyName
          severity
          reactionToAllergy
          doctorTreated
          notes
          siteDisplayName
          source
          attachmentList {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      familyHistory {
        errorCode
        errorMsg
        errorType
        response {
          id
          diseaseName
          authToken
          source
          fileUrl
          familyMember
          notes
          siteDisplayName
          recordDateTime
          age
          familyHistoryFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      immunizations {
        errorCode
        errorMsg
        errorType
        response {
          id
          immunizationName
          dateAdministered
          followUpDate
          registrationId
          dateOfImmunization
          dueDate
          fileUrl
          doctorName
          manufacturer
          batchno
          vaccineName
          potency
          hospitalName
          vaccine_location
          notes
          source
          reactions {
            type
            from
            to
          }
          immunizationFiles {
            id
            fileName
            mimeType
            content
            byteContent
            dateCreated
          }
        }
      }
    }
  }
`;

export const GET_MEDICAL_PRISM_RECORD_V3 = gql`
  query getPatientPrismMedicalRecords_V3($patientId: ID!, $records: [MedicalRecordType]) {
    getPatientPrismMedicalRecords_V3(patientId: $patientId, records: $records) {
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
          identifier
          additionalNotes
          billNo
          testSequence
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
            index
            file_Url
            # content
            # byteContent
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
          siteDisplayName
          source
          fileUrl
          prescriptionFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
          }
          hospital_name
          hospitalId
        }
        errorCode
        errorMsg
        errorType
      }
      healthChecks {
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
          siteDisplayName
          healthCheckSummary
          healthCheckFiles {
            id
            fileName
            mimeType
            content
            # byteContent
            # dateCreated
          }
          source
          healthCheckType
          followupDate
        }
      }
      hospitalizations {
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
          siteDisplayName
          diagnosisNotes
          dateOfDischarge
          dischargeSummary
          doctorInstruction
          dateOfNextVisit
          hospitalizationFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
          source
        }
      }
      medicalBills {
        errorCode
        errorMsg
        errorType
        response {
          id
          bill_no
          hospitalName
          billDate
          source
          siteDisplayName
          notes
          fileUrl
          billDateTime
          billFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      medicalInsurances {
        errorCode
        errorMsg
        errorType
        response {
          id
          insuranceCompany
          policyNumber
          startDate
          endDate
          startDateTime
          endDateTime
          source
          siteDisplayName
          fileUrl
          notes
          sumInsured
          insuranceFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      medicalConditions {
        errorCode
        errorMsg
        errorType
        response {
          id
          medicalConditionName
          doctorTreated
          startDate
          source
          endDate
          notes
          illnessType
          fileUrl
          siteDisplayName
          startDateTime
          endDateTime
          medicationFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      medications {
        errorCode
        errorMsg
        errorType
        response {
          id
          medicineName
          medicalCondition
          doctorName
          startDate
          endDate
          startDateTime
          endDateTime
          morning
          noon
          siteDisplayName
          evening
          notes
          source
        }
      }
      healthRestrictions {
        errorCode
        errorMsg
        errorType
        response {
          id
          startDate
          endDate
          startDateTime
          endDateTime
          restrictionName
          suggestedByDoctor
          nature
          siteDisplayName
          source
          notes
        }
      }
      allergies {
        errorCode
        errorMsg
        errorType
        response {
          id
          startDate
          endDate
          fileUrl
          startDateTime
          endDateTime
          allergyName
          severity
          reactionToAllergy
          doctorTreated
          notes
          siteDisplayName
          source
          attachmentList {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      familyHistory {
        errorCode
        errorMsg
        errorType
        response {
          id
          diseaseName
          authToken
          source
          fileUrl
          familyMember
          notes
          siteDisplayName
          recordDateTime
          age
          familyHistoryFiles {
            id
            fileName
            mimeType
            index
            file_Url
            # content
            # byteContent
            # dateCreated
          }
        }
      }
      immunizations {
        errorCode
        errorMsg
        errorType
        response {
          id
          immunizationName
          dateAdministered
          followUpDate
          registrationId
          dateOfImmunization
          dueDate
          fileUrl
          doctorName
          manufacturer
          batchno
          vaccineName
          potency
          hospitalName
          vaccine_location
          notes
          source
          reactions {
            type
            from
            to
          }
          immunizationFiles {
            id
            fileName
            mimeType
            content
            byteContent
            dateCreated
          }
        }
      }
    }
  }
`;

export const DELETE_HEALTH_RECORD_FILES = gql`
  mutation deleteHealthRecordFiles($deleteHealthRecordFilesInput: DeleteHealthRecordFilesInput) {
    deleteHealthRecordFiles(deleteHealthRecordFilesInput: $deleteHealthRecordFilesInput) {
      status
    }
  }
`;

export const DELETE_MULTIPLE_HEALTH_RECORD_FILES = gql`
  mutation deleteMultipleHealthRecordFiles(
    $deleteMultipleHealthRecordFilesInput: DeleteMultipleHealthRecordFilesInput
  ) {
    deleteMultipleHealthRecordFiles(
      deleteMultipleHealthRecordFilesInput: $deleteMultipleHealthRecordFilesInput
    ) {
      status
    }
  }
`;

export const GET_PHR_USER_NOTIFY_EVENTS = gql`
  query getUserNotifyEvents($patientId: ID!) {
    getUserNotifyEvents(patientId: $patientId) {
      phr {
        newRecordsCount {
          LabTest
          Allergy
          Bill
          HealthCheck
          Hospitalization
          Insurance
          MedicalCondition
          Medication
          Prescription
          Restriction
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

export const GET_INDIVIDUAL_TEST_RESULT_PDF = gql`
  query getIndividualTestResultPdf($patientId: ID!, $recordId: String!, $sequence: String!) {
    getIndividualTestResultPdf(patientId: $patientId, recordId: $recordId, sequence: $sequence) {
      url
    }
  }
`;

export const ADD_PATIENT_MEDICAL_INSURANCE_RECORD = gql`
  mutation addPatientMedicalInsuranceRecord(
    $addPatientMedicalInsuranceRecordInput: AddPatientMedicalInsuranceRecordInput
  ) {
    addPatientMedicalInsuranceRecord(
      addPatientMedicalInsuranceRecordInput: $addPatientMedicalInsuranceRecordInput
    ) {
      status
    }
  }
`;

export const ADD_PATIENT_MEDICAL_BILL_RECORD = gql`
  mutation addPatientMedicalBillRecord(
    $addPatientMedicalBillRecordInput: AddPatientMedicalBillRecordInput
  ) {
    addPatientMedicalBillRecord(
      addPatientMedicalBillRecordInput: $addPatientMedicalBillRecordInput
    ) {
      status
    }
  }
`;

export const ADD_PATIENT_ALLERGY_RECORD = gql`
  mutation addPatientAllergyRecord($addAllergyRecordInput: AddAllergyRecordInput) {
    addPatientAllergyRecord(addAllergyRecordInput: $addAllergyRecordInput) {
      status
    }
  }
`;

export const ADD_PATIENT_HEALTH_RESTRICTION_RECORD = gql`
  mutation addPatientHealthRestrictionRecord(
    $addPatientHealthRestrictionRecordInput: AddPatientHealthRestrictionRecordInput
  ) {
    addPatientHealthRestrictionRecord(
      addPatientHealthRestrictionRecordInput: $addPatientHealthRestrictionRecordInput
    ) {
      status
    }
  }
`;

export const ADD_PATIENT_MEDICATION_RECORD = gql`
  mutation addPatientMedicationRecord(
    $addPatientMedicationRecordInput: AddPatientMedicationRecordInput
  ) {
    addPatientMedicationRecord(addPatientMedicationRecordInput: $addPatientMedicationRecordInput) {
      status
    }
  }
`;

export const ADD_PATIENT_MEDICAL_CONDITION_RECORD = gql`
  mutation addPatientMedicalConditionRecord(
    $addMedicalConditionRecordInput: AddMedicalConditionRecordInput
  ) {
    addPatientMedicalConditionRecord(
      addMedicalConditionRecordInput: $addMedicalConditionRecordInput
    ) {
      status
    }
  }
`;

export const DELETE_PATIENT_PRISM_MEDICAL_RECORD = gql`
  mutation deletePatientPrismMedicalRecord(
    $deletePatientPrismMedicalRecordInput: DeletePatientPrismMedicalRecordInput
  ) {
    deletePatientPrismMedicalRecord(
      deletePatientPrismMedicalRecordInput: $deletePatientPrismMedicalRecordInput
    ) {
      status
    }
  }
`;

export const ADD_FAMILY_HISTORY_RECORD = gql`
  mutation savePatientFamilyHistoryToPRISM($familyHistoryParameters: FamilyHistoryParameters) {
    savePatientFamilyHistoryToPRISM(familyHistoryParameters: $familyHistoryParameters) {
      status
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
          prescriptionGeneratedDate
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
        isAutomatedQuestionsComplete
        isSeniorConsultStarted
        patientInfo {
          firstName
          lastName
          gender
        }
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
          version
          followUpAfterInDays
          doctorType
          medicinePrescription {
            id
            medicineName
            medicineUnit
            medicineTimings
            medicineDosage
            medicineCustomDosage
            medicineConsumptionDurationInDays
            medicineConsumptionDurationUnit
          }
          diagnosticPrescription {
            itemname
            testInstruction
          }
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
  mutation addChatDocument(
    $appointmentId: ID!
    $documentPath: String
    $prismFileId: String
    $fileName: String
  ) {
    addChatDocument(
      appointmentId: $appointmentId
      documentPath: $documentPath
      prismFileId: $prismFileId
      fileName: $fileName
    ) {
      id
      documentPath
      prismFileId
    }
  }
`;

export const GET_PREVIOUS_ORDERS_SKUS = gql`
  mutation getPreviousOrdersSkus($previousOrdersSkus: PreviousOrdersSkus) {
    getPreviousOrdersSkus(previousOrdersSkus: $previousOrdersSkus) {
      SkuDetails
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

export const PHARMA_ORDER_MESSAGE = gql`
  query pharmaOrderMessage($orderId: Int) {
    pharmaOrderMessage(orderId: $orderId) {
      message
      title
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
        packageCalculatedMrp
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
        inclusions
      }
    }
  }
`;

export const SAVE_DIAGNOSTIC_ORDER_NEW = gql`
  mutation saveDiagnosticBookHCOrder($diagnosticOrderInput: SaveBookHomeCollectionOrderInput) {
    saveDiagnosticBookHCOrder(diagnosticOrderInput: $diagnosticOrderInput) {
      orderId
      displayId
      status
      errorMessageToDisplay
      attributes {
        itemids
      }
    }
  }
`;

export const CREATE_INTERNAL_ORDER = gql`
  mutation createOrderInternal($order: OrderCreate) {
    createOrderInternal(order: $order) {
      payment_order_id
      success
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

export const UPLOAD_MEDIA_DOCUMENT_V2 = gql`
  mutation uploadMediaDocumentV2(
    $MediaPrescriptionUploadRequest: MediaPrescriptionUploadRequest
    $uhid: String!
    $appointmentId: ID!
  ) {
    uploadMediaDocumentV2(
      prescriptionInput: $MediaPrescriptionUploadRequest
      uhid: $uhid
      appointmentId: $appointmentId
    ) {
      fileUrl
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
      totalJuniorDoctorsOnline
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
        isConsulted
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
        patientMedicalHistory {
          bp
          dietAllergies
          drugAllergies
          height
          menstrualHistory
          pastMedicalHistory
          pastSurgicalHistory
          temperature
          bloodGroup
          weight
        }
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
          bloodGroup
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
      planPurchaseDetails {
        planPurchased
        totalCashBack
        planValidity
      }
    }
  }
`;

export const GET_PHARMA_TRANSACTION_STATUS_V2 = gql`
  query pharmaPaymentStatusV2($paymentOrderId: String) {
    pharmaPaymentStatusV2(paymentOrderId: $paymentOrderId) {
      paymentRefId
      bankTxnId
      amountPaid
      paymentStatus
      paymentDateTime
      paymentMode
      isSubstitution
      substitutionTime
      substitutionMessage
      planPurchaseDetails {
        planPurchased
        totalCashBack
        planValidity
      }
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
        PaymentOrders {
          paymentRefId
          paymentStatus
          amountPaid
          refund {
            refundAmount
            refundStatus
            refundId
          }
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
        PaymentOrdersPharma {
          paymentRefId
          paymentStatus
          paymentDateTime
          amountPaid
          paymentMode
          refund {
            refundId
            refundAmount
            refundStatus
            txnTimestamp
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
  query GetAllUserSubscriptionsWithPlanBenefitsV2($mobile_number: String!) {
    GetAllUserSubscriptionsWithPlanBenefitsV2(mobile_number: $mobile_number) {
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
        _id
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
      areaSelectionEnabled
    }
  }
`;

export const GET_ALL_GROUP_BANNERS_OF_USER = gql`
  query GetAllGroupBannersOfUser(
    $mobile_number: String!
    $banner_context: String!
    $user_state: UserState
    $banner_display_type: [BannerDisplayType!]
  ) {
    GetAllGroupBannersOfUser(
      mobile_number: $mobile_number
      banner_context: $banner_context
      user_state: $user_state
      banner_display_type: $banner_display_type
    ) {
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
        banner_display_type
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

export const ADD_DIABETIC_QUESTIONNAIRE = gql`
  mutation addDiabeticQuestionnaire($addDiabeticQuestionnaireInput: AddDiabeticQuestionnaireInput) {
    addDiabeticQuestionnaire(addDiabeticQuestionnaireInput: $addDiabeticQuestionnaireInput) {
      success
    }
  }
`;

export const GET_PAYMENT_METHODS = gql`
  query getPaymentMethodsV2($is_mobile: Boolean, $payment_order_id: String!) {
    getPaymentMethodsV2(is_mobile: $is_mobile, payment_order_id: $payment_order_id) {
      name
      minimum_supported_version
      payment_methods {
        image_url
        payment_method_name
        payment_method_code
        minimum_supported_version
        outage_status
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation createOrder($order_input: OrderInputV2) {
    createOrderV2(order_input: $order_input) {
      payment_status
      payment_order_id
      mobile_token {
        client_auth_token_expiry
        client_auth_token
      }
    }
  }
`;

export const UPDATE_ORDER = gql`
  mutation updateOrderDetails($order_input: OrderInputV2) {
    updateOrderDetails(order_input: $order_input) {
      payment_status
      payment_order_id
      mobile_token {
        client_auth_token_expiry
        client_auth_token
      }
    }
  }
`;

export const GET_INTERNAL_ORDER = gql`
  query getOrderInternal($order_id: String!) {
    getOrderInternal(order_id: $order_id) {
      id
      txn_uuid
      txn_id
      status_id
      payment_order_id
      DiagnosticsPaymentDetails {
        ordersList {
          id
          patientId
          primaryOrderID
          displayId
          slotDateTimeInUTC
          attributesObj {
            slotDurationInMinutes
          }
          patientObj {
            id
            firstName
            lastName
            gender
          }
          diagnosticOrderLineItems {
            itemId
            itemName
            price
            editOrderID
          }
        }
      }
      refunds {
        status
        unique_request_id
        sent_to_gateway
        initiated_by
        created_at
        updated_at
        amount
      }
    }
  }
`;

export const GET_APPOINTMENT_INFO = gql`
  query getAppointmentInfo($order_id: String!) {
    getOrderInternal(order_id: $order_id) {
      payment_order_id
      payment_status
      AppointmentDetails {
        displayId
        amountBreakup {
          actual_price
          slashed_price
        }
      }
    }
  }
`;

export const PROCESS_DIAG_COD_ORDER = gql`
  mutation processDiagnosticHCOrder($processDiagnosticHCOrderInput: ProcessDiagnosticHCOrderInput) {
    processDiagnosticHCOrder(processDiagnosticHCOrderInput: $processDiagnosticHCOrderInput) {
      status
      preBookingID
      message
    }
  }
`;

export const VERIFY_VPA = gql`
  mutation verifyVPA($verifyVPA: VerifyVPA) {
    verifyVPA(verifyVPA: $verifyVPA) {
      vpa
      status
      customer_name
    }
  }
`;

export const GET_USER_PROFILE_TYPE = gql`
  query getUserProfileType($mobileNumber: String!) {
    getUserProfileType(mobileNumber: $mobileNumber) {
      profile
    }
  }
`;

export const UPDATE_APPOINTMENT = gql`
  mutation updateAppointment($appointmentInput: UpdateAppointmentInput) {
    updateAppointment(appointmentInput: $appointmentInput) {
      error
      status
    }
  }
`;

export const INITIATE_DOC_ON_CALL = gql`
  query initiateDocOnCall($mobileNumber: String, $callType: docOnCallType) {
    initiateDocOnCall(mobileNumber: $mobileNumber, callType: $callType) {
      success
    }
  }
`;

export const GET_DIAGNOSTIC_NEAREST_AREA = gql`
  query getNearestArea($patientAddressId: String!) {
    getNearestArea(patientAddressId: $patientAddressId) {
      area {
        id
        area
      }
    }
  }
`;

export const GET_CUSTOMIZED_DIAGNOSTIC_SLOTS = gql`
  query getDiagnosticSlotsCustomized(
    $selectedDate: Date!
    $areaID: Int!
    $itemIds: [Int!]!
    $patientAddressObj: AddressObj
  ) {
    getDiagnosticSlotsCustomized(
      selectedDate: $selectedDate
      areaID: $areaID
      itemIds: $itemIds
      patientAddressObj: $patientAddressObj
    ) {
      slots {
        Timeslot
        TimeslotID
      }
    }
  }
`;

export const GET_DIAGNOSTICS_ORDER_BY_DISPLAY_ID = gql`
  query getDiagnosticOrderDetailsByDisplayID($displayId: Int!) {
    getDiagnosticOrderDetailsByDisplayID(displayId: $displayId) {
      ordersList {
        patientId
        patientAddressId
        orderStatus
        totalPrice
        createdDate
        slotDateTimeInUTC
        visitNo
        isRescheduled
        preBookingId
        id
        attributesObj {
          homeCollectionCharges
          slotDurationInMinutes
          expectedReportGenerationTime
          reportTATMessage
        }
        diagnosticOrdersStatus {
          orderStatus
        }
      }
    }
  }
`;

export const GET_OTP_ON_CALL = gql`
  query getOTPOnCall($mobileNumber: String, $loginType: LOGIN_TYPE, $id: String!) {
    getOTPOnCall(mobileNumber: $mobileNumber, loginType: $loginType, id: $id) {
      status
      loginId
      message
    }
  }
`;

export const INITIATE_DIAGNOSTIC_ORDER_PAYMENT = gql`
  mutation initiateDiagonsticHCOrderPayment(
    $diagnosticInitiateOrderPaymentInput: DiagnosticInitiateOrderPayment!
  ) {
    initiateDiagonsticHCOrderPayment(
      diagnosticInitiateOrderPaymentInput: $diagnosticInitiateOrderPaymentInput
    ) {
      status
    }
  }
`;

export const GET_ORDER_LEVEL_DIAGNOSTIC_STATUS = gql`
  query getHCOrderFormattedTrackingHistory($diagnosticOrderID: String) {
    getHCOrderFormattedTrackingHistory(diagnosticOrderID: $diagnosticOrderID) {
      statusHistory {
        statusDate
        orderStatus
      }
      groupedPendingReportInclusions {
        inclusions {
          itemId
          itemName
          packageId
          packageName
          orderStatus
        }
        isReportPending
        reportTATMessage
        expectedReportGenerationTime
      }
      statusInclusions {
        statusDate
        orderStatus
        itemId
        packageId
        itemName
        packageName
      }
      upcomingStatuses {
        orderStatus
      }
    }
  }
`;

export const VERIFY_TRUECALLER_PROFILE = gql`
  mutation verifyTrueCallerProfile($profile: TrueCallerProfile!) {
    verifyTrueCallerProfile(profile: $profile) {
      authToken
    }
  }
`;

export const GET_ALL_PRO_HEALTH_APPOINTMENTS = gql`
  query getAllProhealthAppointments($patientId: ID!) {
    getAllProhealthAppointments(patientId: $patientId) {
      appointments {
        appointmentStartDateTimeUTC
        appointmentEndDateTimeUTC
        status
        displayId
        packageCategoryId
        price
        bookingSource
        patientObj {
          firstName
          lastName
          emailAddress
          gender
          mobileNumber
          dateOfBirth
        }
        prohealthPackage {
          packageName
          id
        }
        prohealthHospital {
          unitType
          unitName
        }
      }
    }
  }
`;

export const GET_PHLOBE_DETAILS = gql`
  query getOrderPhleboDetailsBulk($diagnosticOrdersIds: [String]!) {
    getOrderPhleboDetailsBulk(diagnosticOrdersIds: $diagnosticOrdersIds) {
      orderPhleboDetailsBulk {
        allowCalling
        orderPhleboDetails {
          diagnosticOrdersId
          diagnosticPhlebotomists {
            name
            mobile
            vaccinationStatus
          }
          phleboOTP
          phleboTrackLink
          phleboRating
        }
        phleboEta {
          distanceInMetres
          estimatedArrivalTime
        }
      }
    }
  }
`;

export const GET_PATIENT_LATEST_PRESCRIPTION = gql`
  query getPatientLatestPrescriptions($mobileNumber: String!, $limit: Int!, $cityId: Int!) {
    getPatientLatestPrescriptions(mobileNumber: $mobileNumber, limit: $limit, cityId: $cityId) {
      doctorName
      doctorCredentials
      patientName
      prescriptionDateTime
      numberOfTests
      orderCount
      caseSheet {
        id
        blobName
        diagnosticPrescription {
          itemId
          itemname
          testInstruction
        }
      }
    }
  }
`;

export const GET_DIAGNOSTIC_OPEN_ORDERLIST = gql`
  query getDiagnosticOpenOrdersList($mobileNumber: String!, $skip: Int!, $take: Int!) {
    getDiagnosticOpenOrdersList(mobileNumber: $mobileNumber, skip: $skip, take: $take) {
      openOrders {
        id
        displayId
        patientId
        orderStatus
        slotDateTimeInUTC
        labReportURL
        paymentType
        patientObj {
          firstName
          lastName
        }
        attributesObj {
          reportTATMessage
          reportGenerationTime
          expectedReportGenerationTime
        }
        diagnosticOrderLineItems {
          itemObj {
            testPreparationData
            preTestingRequirement
          }
        }
      }
    }
  }
`;

export const GET_PATIENT_PAST_CONSULTED_DOCTORS = gql`
  query getPatientPastConsultedDoctors($patientMobile: String, $offset: Int, $limit: Int) {
    getPatientPastConsultedDoctors(patientMobile: $patientMobile, offset: $offset, limit: $limit) {
      id
      fullName
      thumbnailUrl
      specialty {
        name
      }
      allowBookingRequest
      consultDetails {
        consultDateTime
        displayId
        appointmentId
        hospitalId
        hospitalName
        consultMode
        _247_Flag
      }
    }
  }
`;

export const GET_DIAGNOSTIC_CLOSED_ORDERLIST = gql`
  query getDiagnosticClosedOrdersList($mobileNumber: String!, $skip: Int!, $take: Int!) {
    getDiagnosticClosedOrdersList(mobileNumber: $mobileNumber, skip: $skip, take: $take) {
      closedOrders {
        id
        displayId
        patientId
        orderStatus
        slotDateTimeInUTC
        labReportURL
        paymentType
        patientObj {
          firstName
          lastName
        }
        diagnosticOrderLineItems {
          itemObj {
            testPreparationData
            preTestingRequirement
          }
        }
        attributesObj {
          reportTATMessage
          reportGenerationTime
          expectedReportGenerationTime
        }
      }
    }
  }
`;

export const MODIFY_DIAGNOSTIC_ORDERS = gql`
  mutation saveModifyDiagnosticOrder($saveModifyDiagnosticOrder: saveModifyDiagnosticOrderInput!) {
    saveModifyDiagnosticOrder(saveModifyDiagnosticOrder: $saveModifyDiagnosticOrder) {
      orderId
      displayId
      status
      errorMessageToDisplay
      attributes {
        itemids
      }
    }
  }
`;

export const GET_PROHEALTH_HOSPITAL_BY_SLUG = gql`
  query getProHealthHospitalBySlug($hospitalSlug: String!) {
    getProHealthHospitalBySlug(hospitalSlug: $hospitalSlug) {
      hospitals {
        id
      }
    }
  }
`;

export const SAVE_PHLEBO_FEEDBACK = gql`
  mutation savePhleboFeedback(
    $phleboRating: Int!
    $phleboFeedback: String
    $diagnosticOrdersId: String!
    $patientComments: String
  ) {
    savePhleboFeedback(
      phleboRating: $phleboRating
      phleboFeedback: $phleboFeedback
      diagnosticOrdersId: $diagnosticOrdersId
      patientComments: $patientComments
    ) {
      status
    }
  }
`;

export const GET_HELPDESK_TICKETS = gql`
  query getHelpdeskTickets {
    getHelpdeskTickets {
      tickets {
        statusType
        subject
        createdTime
        ticketNumber
        modifiedTime
        channel
        closedTime
        id
        status
        customFields {
          Business
        }
      }
      count
    }
  }
`;

export const UPDATE_HELPDESK_TICKET = gql`
  mutation updateHelpdeskTicket($updateHelpdeskTicketInput: UpdateHelpdeskTicketInput!) {
    updateHelpdeskTicket(updateHelpdeskTicketInput: $updateHelpdeskTicketInput) {
      ticket {
        ticketNumber
      }
    }
  }
`;

export const ADD_COMMENTS_HELPDESK_TICKET = gql`
  mutation addCommentHelpdeskTicket(
    $addCommentHelpdeskTicketInput: AddCommentHelpdeskTicketInput!
  ) {
    addCommentHelpdeskTicket(addCommentHelpdeskTicketInput: $addCommentHelpdeskTicketInput) {
      status
    }
  }
`;

export const GET_HELPDESK_TICKET_CONVERSATION = gql`
  query getHelpdeskTicketConversation($ticketId: String!) {
    getHelpdeskTicketConversation(ticketId: $ticketId) {
      conversations {
        id
        type
        contentType
        comment
        commenterName
        commenterType
        createdTime
      }
    }
  }
`;

export const FIND_DIAGNOSTIC_SETTINGS = gql`
  query findDiagnosticSettings {
    findDiagnosticSettings {
      phleboETAInMinutes
    }
  }
`;

export const GET_VACCINE_BOOKING_LIMIT = gql`
  query GetBenefitAvailabilityInfoByCMSIdentifier(
    $user_subscription_id: String!
    $cms_identifier: String!
  ) {
    GetBenefitAvailabilityInfoByCMSIdentifier(
      user_subscription_id: $user_subscription_id
      cms_identifier: $cms_identifier
    ) {
      response
    }
  }
`;

export const VALIDATE_CORPORATE_DOMAIN = gql`
  query getCMSIdentifierByDomain($email: String!) {
    getCMSIdentifierByDomain(email: $email) {
      success
      groupIdentifier
    }
  }
`;

export const GENERATE_CORPORATE_OTP_MAIL = gql`
  query GenerateOtpEmailId($email: String!) {
    GenerateOtpEmailId(GenerateOtpEmailIdInput: { email: $email }) {
      status
      loginId
      message
    }
  }
`;

export const VERIFY_CORPORATE_EMAIL_OTP_AND_SUBSCRIBE = gql`
  query verifyCorporateEmailOtpAndSubscribe($corporateEmailOtpInput: CorporateEmailOtpInput!) {
    verifyCorporateEmailOtpAndSubscribe(corporateEmailOtpInput: $corporateEmailOtpInput) {
      status
      reason
      isBlocked
      incorrectAttempts
      isSubscriptionSkipped
    }
  }
`;

///---BELOW is pointed to vaccine endpoint-------->>

export const CANCEL_VACCINATION_APPOINTMENT = gql`
  mutation CancelAppointment($appointment_id: String, $display_id: Float) {
    CancelAppointment(appointment_id: $appointment_id, display_id: $display_id) {
      code
      success
      message
      response {
        id
        status
      }
    }
  }
`;

export const GET_ALL_VACCINATION_APPOINTMENTS = gql`
  query GetAllAppointments {
    GetAllAppointments {
      code
      success
      message
      response {
        id
        dose_number
        resource_id
        patient_info {
          firstName
          lastName
          age
          gender
          uhid
          relation
        }
        status
        payment_type
        resource_session_details {
          session_name
          start_date_time
          vaccine_type
          resource_detail {
            name
            street_line1
            street_line2
            street_line3
            city
            state
          }
        }
        display_id
        payment_type
      }
    }
  }
`;

export const GET_VACCINATION_SITES = gql`
  query getResourcesList($city: String!, $vaccine_type: VACCINE_TYPE, $is_retail: Boolean) {
    getResourcesList(city: $city, vaccine_type: $vaccine_type, is_retail: $is_retail) {
      code
      success
      message
      response {
        id
        name
        created_at
        city
        is_corporate_site
        street_line1
        street_line2
        street_line3
        session_dates {
          date
          available
        }
      }
    }
  }
`;

export const GET_OTP_COWIN = gql`
  mutation CowinLoginVerify($cowinLoginVerify: CowinLoginVerifyInput!) {
    cowinLoginVerify(cowinLoginVerify: $cowinLoginVerify) {
      code
      message
      response {
        txnId
        token
        errorCode
        error
      }
    }
  }
`;

export const GET_BENEFICIARY_PROFILES = gql`
  query GetCowinBeneficiary($getCowinBeneficiary: GetCowinBeneficiaryInput!) {
    getCowinBeneficiary(getCowinBeneficiary: $getCowinBeneficiary) {
      code
      message
      response {
        beneficiary_reference_id
        name
        photo_id_type
        photo_id_number
        vaccination_status
        vaccine
        dose1_date
        dose2_date
      }
    }
  }
`;

export const GET_VACCINATION_AVAILABLE_DATES = gql`
  query getResourcesSessionAvailableDate($resource_id: String!, $vaccine_type: VACCINE_TYPE) {
    getResourcesSessionAvailableDate(resource_id: $resource_id, vaccine_type: $vaccine_type) {
      code
      success
      message
      response
    }
  }
`;

export const GET_VACCINATION_SLOTS = gql`
  query getResourcesSessionAvailableByDate(
    $resource_id: String!
    $session_date: Date
    $vaccine_type: VACCINE_TYPE
    $is_retail: Boolean
  ) {
    getResourcesSessionAvailableByDate(
      resource_id: $resource_id
      session_date: $session_date
      vaccine_type: $vaccine_type
      is_retail: $is_retail
    ) {
      code
      success
      message
      response {
        start_date_time
        end_date_time
        session_name
        id
        selling_price
        vaccine_type
        available_for_booking
        payment_type
      }
    }
  }
`;

export const SUBMIT_VACCINATION_BOOKING_REQUEST = gql`
  mutation CreateAppointment($appointmentInput: CreateAppointmentInput!) {
    CreateAppointment(appointmentInput: $appointmentInput) {
      response {
        display_id
        id
      }
      success
      code
      message
    }
  }
`;

export const GET_VACCINATION_APPOINMENT_DETAILS = gql`
  query GetAppointmentDetails($appointment_id: String!) {
    GetAppointmentDetails(appointment_id: $appointment_id) {
      message
      code
      response {
        id
        display_id
        dose_number
        patient_info {
          firstName
          lastName
          age
          gender
          uhid
          id
          mobileNumber
        }
        status
        payment_type
        resource_session_details {
          session_name
          start_date_time
          vaccine_type
          station_name
          selling_price
          resource_detail {
            name
            street_line1
            street_line2
            street_line3
            city
            state
            is_corporate_site
          }
        }
      }
    }
  }
`;

export const MAKE_APPOINTMENT_BOOKING_REQUEST = gql`
  mutation appointmentBookingRequest($bookAppointment: AppointmentBookingRequestInput!) {
    appointmentBookingRequest(appointmentInput: $bookAppointment) {
      appointment {
        id
        doctorId
        appointmentDateTime
        status
        appointmentType
        patientId
        __typename
      }
      __typename
    }
  }
`;

export const FETCH_JUSPAY_CUSTOMERID = gql`
  mutation generateUniqueCustomerId {
    generateUniqueCustomerId {
      customer_id
    }
  }
`;

export const FETCH_SAVED_CARDS = gql`
  query getSavedCardList($customer_id: String!) {
    getSavedCardList(customer_id: $customer_id) {
      customer_id
      merchantId
      cards {
        card_number
        card_isin
        card_exp_year
        card_exp_month
        card_type
        card_issuer
        card_brand
        name_on_card
        expired
        card_token
      }
    }
  }
`;

export const DELETE_SAVED_CARD = gql`
  mutation deleteCardFromLocker($cardToken: String!) {
    deleteCardFromLocker(cardToken: $cardToken) {
      card_token
      deleted
    }
  }
`;

export const COWIN_REGISTRATION = gql`
  mutation cowinRegistration($cowinRegistration: CowinRegistrationInput!) {
    cowinRegistration(cowinRegistration: $cowinRegistration) {
      code
      response {
        txnId
        beneficiary_reference_id
        errorCode
        error
      }
      message
    }
  }
`;

export const GET_RESCHEDULE_AND_CANCELLATION_REASONS = gql`
  query getRescheduleAndCancellationReasons($appointmentDateTimeInUTC: DateTime!) {
    getRescheduleAndCancellationReasons(appointmentDateTimeInUTC: $appointmentDateTimeInUTC) {
      rescheduleReasons
      cancellationReasons
    }
  }
`;

export const DIAGNOSITC_EXOTEL_CALLING = gql`
  mutation diagnosticExotelCalling($orderId: ID!) {
    diagnosticExotelCalling(orderId: $orderId) {
      errorMessage
      sid
      success
    }
  }
`;

export const GET_DIAGNOSTIC_PAYMENT_SETTINGS = gql`
  query getDiagnosticPaymentSettings($paymentOrderId: String!) {
    getDiagnosticPaymentSettings(paymentOrderId: $paymentOrderId) {
      cod
      hc_credits_message
    }
  }
`;

export const GET_PRODUCT_SUBSTITUTES = gql`
  query pharmaSubstitution($substitutionInput: PharmaSubstitutionRequest) {
    pharmaSubstitution(substitutionInput: $substitutionInput) {
      substitutes {
        sku
        name
        price
        mou
        image
        thumbnail
        small_image
        is_express
        is_in_contract
        is_prescription_required
        description
        subcategory
        type_id
        url_key
        is_in_stock
        MaxOrderQty
        sell_online
        manufacturer
        dc_availability
        tat
        tatDuration
        tatPrice
      }
    }
  }
`;

export const POST_WEB_ENGAGE = gql`
  mutation postConsultEventToDoctor($doctorConsultEventInput: PatientConsultEventToDoctorInput!) {
    postConsultEventToDoctor(doctorConsultEventInput: $doctorConsultEventInput) {
      response {
        status
      }
    }
  }
`;

export const GET_DIAGNOSTICS_RECOMMENDATIONS = gql`
  mutation getDiagnosticItemRecommendations($itemIds: [Int]!, $records: Int) {
    getDiagnosticItemRecommendations(itemIds: $itemIds, numberOfRecordsToFetch: $records) {
      itemsData {
        itemId
        itemName
        combinedLift
      }
    }
  }
`;

export const GET_DIAGNOSTIC_EXPRESS_SLOTS_INFO = gql`
  query getUpcomingSlotInfo(
    $latitude: Float!
    $longitude: Float!
    $zipcode: String!
    $serviceability: DiagnosticsServiceability!
  ) {
    getUpcomingSlotInfo(
      latitude: $latitude
      longitude: $longitude
      zipcode: $zipcode
      serviceability: $serviceability
    ) {
      status
      slotInfo
    }
  }
`;

export const GET_DIAGNOSTIC_REPORT_TAT = gql`
  query getConfigurableReportTAT(
    $slotDateTimeInUTC: DateTime
    $cityId: Int!
    $pincode: Int!
    $itemIds: [Int]!
  ) {
    getConfigurableReportTAT(
      slotDateTimeInUTC: $slotDateTimeInUTC
      cityId: $cityId
      pincode: $pincode
      itemIds: $itemIds
    ) {
      maxReportTAT
      reportTATMessage
      itemLevelReportTATs {
        itemId
        reportTATMessage
        reportTATInUTC
      }
    }
  }
`;

export const GET_PATIENT_PRESCRIPTIONS = gql`
query {
  getPatientPrescriptions(
    patientId: $patientId
    limit: 100
  ) {
    response {
      doctorName
      patientName
      caseSheet {
        notes
        blobName
        consultType
        prescriptionGeneratedDate
        diagnosis {
          name
          __typename
        }
        diagnosticPrescription {
          itemname
          __typename
        }
        doctorId
        doctorType
        followUp
        followUpAfterInDays
        followUpDate
        followUpConsultType
        id
        medicinePrescription {
          medicineConsumptionDurationInDays
          medicineDosage
          id
          medicineCustomDetails
          medicineConsumptionDurationUnit
          medicineFormTypes
          medicineFrequency
          medicineInstructions
          medicineName
          medicineTimings
          medicineToBeTaken
          medicineUnit
          routeOfAdministration
          __typename
        }
        symptoms {
          symptom
          since
          howOften
          severity
          details
          __typename
        }
        otherInstructions {
          instruction
          __typename
        }
        __typename
      }
    }
  }
  getPatientPrismMedicalRecords_V2(
    patientId: $patientId
    records: [PRESCRIPTION]
  ) {
    prescriptions {
      response {
        id
        prescriptionName
        date
        prescribedBy
        notes
        prescriptionSource
        source
        siteDisplayName
        fileUrl
        prescriptionFiles {
          id
          fileName
          mimeType
          content
          byteContent
          __typename
        }
        __typename
      }
      errorCode
      errorMsg
      errorType
      __typename
    }
  }
}
`

export const ADD_PATIENT_PRESCRIPTION_RECORD = gql`
  mutation addPatientPrescriptionRecord($AddPrescriptionRecordInput: AddPrescriptionRecordInput) {
    addPatientPrescriptionRecord(addPrescriptionRecordInput: $AddPrescriptionRecordInput) {
      status
      __typename
    }
  }
`;

export const SAVE_JUSPAY_SDK_RESPONSE = gql`
  mutation saveJuspayResponseForAudit($auditInput: AuditInput) {
    saveJuspayResponseForAudit(auditInput: $auditInput) {
      success
    }
  }
`;

export const GET_JUSPAY_CLIENTAUTH_TOKEN = gql`
  query getCustomer(
    $customerId: String
    $is_pharma_juspay: Boolean
    $get_client_auth_token: Boolean
  ) {
    getCustomer(
      customerId: $customerId
      is_pharma_juspay: $is_pharma_juspay
      get_client_auth_token: $get_client_auth_token
    ) {
      mobile_number
      juspay {
        client_auth_token
        client_auth_token_expiry
      }
    }
  }
`;
