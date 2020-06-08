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
      fullName
      displayName
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
      signature
      specialty {
        name
      }
      consultHours {
        consultMode
        consultType
        startTime
        endTime
        weekDay
        isActive
        consultDuration
        consultBuffer
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
      starTeam {
        isActive
        associatedDoctor {
          firstName
          lastName
          emailAddress
          id
          experience
          photoUrl
          mobileNumber
          salutation
          qualification
          doctorHospital {
            facility {
              state
              city
              country
              streetLine1
              streetLine3
              streetLine2
            }
          }
        }
      }
      doctorSecretary {
        secretary {
          id
          isActive
          name
          mobileNumber
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

export const GET_DOCTOR_APPOINTMENTS = gql`
  query GetDoctorAppointments($startDate: Date, $endDate: Date) {
    getDoctorAppointments(startDate: $startDate, endDate: $endDate) {
      appointmentsHistory {
        id
        patientId
        appointmentDateTime
        status
        doctorId
        bookingDate
        appointmentType
        appointmentState
        displayId
        isFollowUp
        followUpParentId
        caseSheet {
          appointment {
            appointmentDateTime
          }
          followUp
          followUpDate
          followUpAfterInDays
          symptoms {
            symptom
          }
          id
          status
          doctorType
          sentToPatient
          blobName
          doctorId
        }
        patientInfo {
          id
          firstName
          lastName
          relation
          photoUrl
          uhid
          dateOfBirth
          emailAddress
          mobileNumber
          gender
          addressList {
            city
          }
        }
      }
      newPatientsList
    }
  }
`;
export const GET_PATIENT_LOG = gql`
  query getPatientLog($limit: Int, $offset: Int, $sortBy: patientLogSort, $type: patientLogType) {
    getPatientLog(limit: $limit, offset: $offset, sortBy: $sortBy, type: $type) {
      patientLog {
        patientid
        consultscount
        appointmentids
        appointmentdatetime
        patientInfo {
          firstName
          dateOfBirth
          id
          emailAddress
          mobileNumber
          gender
          uhid
          photoUrl
          addressList {
            city
          }
        }
        unreadMessagesCount {
          appointmentId
          count
        }
      }
      totalResultCount
    }
  }
`;

export const CREATEAPPOINTMENTSESSION = gql`
  mutation CreateAppointmentSession($createAppointmentSessionInput: CreateAppointmentSessionInput) {
    createAppointmentSession(createAppointmentSessionInput: $createAppointmentSessionInput) {
      sessionId
      appointmentToken
      doctorId
    }
  }
`;

export const END_APPOINTMENT_SESSION = gql`
  mutation EndAppointmentSession($endAppointmentSessionInput: EndAppointmentSessionInput) {
    endAppointmentSession(endAppointmentSessionInput: $endAppointmentSessionInput)
  }
`;

export const MODIFY_CASESHEET = gql`
  mutation modifyCaseSheet($ModifyCaseSheetInput: ModifyCaseSheetInput) {
    modifyCaseSheet(ModifyCaseSheetInput: $ModifyCaseSheetInput) {
      patientDetails {
        allergies
        dateOfBirth
        emailAddress
        firstName
        familyHistory {
          description
          relation
        }
        gender
        healthVault {
          imageUrls
          reportUrls
        }
        id
        lastName
        lifeStyle {
          description
          occupationHistory
        }
        mobileNumber
        patientAddress {
          id
          addressLine1
          addressLine2
          city
          mobileNumber
          state
          zipcode
          landmark
          createdDate
          updatedDate
          addressType
          otherAddressType
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
          weight
          medicationHistory
        }
        photoUrl
        uhid
        relation
      }
      appointment {
        id
        appointmentDateTime
        appointmentDocuments {
          documentPath
          prismFileId
        }
        appointmentState
        appointmentType
        displayId
        doctorId
        hospitalId
        patientId
        parentId
        status
        rescheduleCount
        rescheduleCountByDoctor
        isFollowUp
        followUpParentId
        isTransfer
        transferParentId
        sdConsultationDate
      }
      blobName
      createdDate
      createdDoctorId
      createdDoctorProfile {
        city
        country
        doctorType
        delegateNumber
        emailAddress
        experience
        firstName
        gender
        id
        lastName
        mobileNumber
        photoUrl
        qualification
        salutation
        state
        streetLine1
        streetLine2
        streetLine3
        zip
        registrationNumber
        signature
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
        doctorHospital {
          facility {
            city
            country
            state
            streetLine1
            streetLine2
            streetLine3
            zipcode
          }
        }
      }
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
      followUpConsultType
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
        details
      }
      status
      sentToPatient
      updatedDate
      referralSpecialtyName
      referralDescription
    }
  }
`;

export const MAKE_TEAM_DOCTOR_ACTIVE = gql`
  mutation MakeTeamDoctorActive($associatedDoctor: String!, $starDoctor: String!) {
    makeTeamDoctorActive(associatedDoctor: $associatedDoctor, starDoctor: $starDoctor)
  }
`;

export const REMOVE_DELEGATE_NUMBER = gql`
  mutation RemoveDelegateNumber {
    removeDelegateNumber {
      city
      country
      doctorType
      delegateNumber
      emailAddress
      experience
      firstName
      gender
      id
      lastName
      mobileNumber
      photoUrl
      qualification
      salutation
      state
      streetLine1
      streetLine2
      streetLine3
      zip
      specialty {
        id
        name
        createdDate
        image
      }
    }
  }
`;

export const REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM = gql`
  mutation removeTeamDoctorFromStarTeam($associatedDoctor: String!, $starDoctor: String!) {
    removeTeamDoctorFromStarTeam(associatedDoctor: $associatedDoctor, starDoctor: $starDoctor) {
      firstName
    }
  }
`;

export const UPDATE_DELEGATE_NUMBER = gql`
  mutation UpdateDelegateNumber($delegateNumber: String!) {
    updateDelegateNumber(delegateNumber: $delegateNumber) {
      city
      country
      doctorType
      delegateNumber
      emailAddress
      experience
      firstName
      id
      lastName
      mobileNumber
      photoUrl
      qualification
      salutation
      state
      streetLine1
      streetLine2
      streetLine3
      zip
      specialty {
        id
        name
        createdDate
        image
      }
    }
  }
`;

export const GET_JUNIOR_DOCTOR_CASESHEET = gql`
  query GetJuniorDoctorCaseSheet($appointmentId: String!) {
    getJuniorDoctorCaseSheet(appointmentId: $appointmentId) {
      patientDetails {
        id
        allergies
        lifeStyle {
          description
        }
        familyHistory {
          description
          relation
        }
        dateOfBirth
        emailAddress
        firstName
        lastName
        gender
        mobileNumber
        uhid
        photoUrl
        relation
        healthVault {
          imageUrls
          reportUrls
        }
      }
      caseSheetDetails {
        id
        medicinePrescription {
          id
          medicineName
          medicineDosage
          medicineToBeTaken
          medicineInstructions
          medicineTimings
          medicineConsumptionDurationInDays
        }
        otherInstructions {
          instruction
        }
        symptoms {
          symptom
          since
          howOften
          severity
        }
        diagnosis {
          name
        }
        diagnosticPrescription {
          itemname
        }
        followUp
        followUpDate
        followUpAfterInDays
        consultType
        notes
      }
    }
  }
`;

export const GET_CASESHEET = gql`
  query GetCaseSheet($appointmentId: String!) {
    getCaseSheet(appointmentId: $appointmentId) {
      patientDetails {
        id
        allergies
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
          weight
          medicationHistory
        }
        familyHistory {
          description
          relation
        }
        patientAddress {
          city
        }
        dateOfBirth
        emailAddress
        firstName
        lastName
        gender
        mobileNumber
        uhid
        photoUrl
        relation
        healthVault {
          imageUrls
          reportUrls
        }
      }
      caseSheetDetails {
        id
        blobName
        doctorId
        patientId
        sentToPatient
        status
        referralSpecialtyName
        referralDescription
        patientDetails {
          allergies
          dateOfBirth
          emailAddress
          firstName
          familyHistory {
            description
            relation
          }
          gender
          healthVault {
            imageUrls
            reportUrls
          }
          id
          lastName
          lifeStyle {
            description
            occupationHistory
          }
          mobileNumber
          patientAddress {
            id
            addressLine1
            addressLine2
            city
            mobileNumber
            state
            zipcode
            landmark
            createdDate
            updatedDate
            addressType
            otherAddressType
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
            weight
            medicationHistory
          }
          photoUrl
          uhid
          relation
        }
        appointment {
          id
          appointmentDateTime
          appointmentDocuments {
            documentPath
            prismFileId
          }
          appointmentState
          appointmentType
          displayId
          doctorId
          hospitalId
          patientId
          parentId
          status
          rescheduleCount
          rescheduleCountByDoctor
          isFollowUp
          followUpParentId
          isTransfer
          transferParentId
          sdConsultationDate
        }
        createdDoctorProfile {
          doctorType
          emailAddress
          firstName
          lastName
          salutation
          registrationNumber
          signature
          photoUrl
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
          doctorHospital {
            facility {
              city
              country
              state
              streetLine1
              streetLine2
              streetLine3
              zipcode
            }
          }
        }
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
        otherInstructions {
          instruction
        }
        symptoms {
          symptom
          since
          howOften
          severity
          details
        }
        diagnosis {
          name
        }
        diagnosticPrescription {
          itemname
        }
        followUp
        followUpDate
        followUpAfterInDays
        followUpConsultType
        consultType
        notes
        updatedDate
      }
      pastAppointments {
        id
        displayId
        appointmentDateTime
        appointmentState
        doctorId
        hospitalId
        patientId
        parentId
        status
        caseSheet {
          consultType
          doctorType
          referralSpecialtyName
          referralDescription
          diagnosis {
            name
          }
          diagnosticPrescription {
            itemname
          }
          symptoms {
            symptom
            since
            howOften
            severity
            details
          }
          followUpDate
          followUpAfterInDays
          followUp
          medicinePrescription {
            medicineName
            medicineTimings
            medicineInstructions
            medicineConsumptionDurationInDays
            medicineConsumptionDuration
            medicineFormTypes
            medicineFrequency
            medicineConsumptionDurationUnit
          }
          otherInstructions {
            instruction
          }
          notes
        }
        appointmentType
        sdConsultationDate
      }
      juniorDoctorNotes
      juniorDoctorCaseSheet {
        createdDate
        doctorId
        createdDoctorProfile {
          firstName
          lastName
          salutation
        }
        updatedDate
      }
      allowedDosages
    }
  }
`;

export const CREATE_CASESHEET_FOR_SRD = gql`
  mutation CreateSeniorDoctorCaseSheet($appointmentId: String) {
    createSeniorDoctorCaseSheet(appointmentId: $appointmentId) {
      appointment {
        id
        appointmentDateTime
        appointmentState
        appointmentType
        displayId
        doctorId
        hospitalId
        patientId
        parentId
        status
        rescheduleCount
        sdConsultationDate
      }
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
        medicineConsumptionDurationInDays
        medicineDosage
        medicineInstructions
        medicineTimings
        medicineUnit
        medicineToBeTaken
        medicineName
        id
        medicineConsumptionDuration
        medicineFormTypes
        medicineFrequency
        medicineConsumptionDurationUnit
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
        details
      }
    }
  }
`;
export const SAVE_DOCTOR_DEVICE_TOKEN = gql`
  mutation saveDoctorDeviceToken($SaveDoctorDeviceTokenInput: SaveDoctorDeviceTokenInput!) {
    saveDoctorDeviceToken(SaveDoctorDeviceTokenInput: $SaveDoctorDeviceTokenInput) {
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

export const INITIATE_TRANSFER_APPONITMENT = gql`
  mutation initiateTransferAppointment($TransferAppointmentInput: TransferAppointmentInput!) {
    initiateTransferAppointment(TransferAppointmentInput: $TransferAppointmentInput) {
      transferAppointment {
        id
        transferStatus
        transferReason
        transferredDoctorId
        transferredSpecialtyId
      }
      doctorNextSlot
    }
  }
`;

export const INITIATE_RESCHDULE_APPONITMENT = gql`
  mutation initiateRescheduleAppointment($RescheduleAppointmentInput: RescheduleAppointmentInput!) {
    initiateRescheduleAppointment(RescheduleAppointmentInput: $RescheduleAppointmentInput) {
      rescheduleAppointment {
        id
        rescheduleStatus
        rescheduleReason
        rescheduledDateTime
      }
      rescheduleCount
    }
  }
`;

export const SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME = gql`
  query SearchDoctorAndSpecialtyByName($searchText: String!) {
    SearchDoctorAndSpecialtyByName(searchText: $searchText) {
      doctors {
        firstName
        lastName
        specialty {
          name
          id
        }
        specialization
        photoUrl
        id
        experience
        doctorHospital {
          facility {
            id
            name
          }
        }
      }
      specialties {
        id
        name
        image
      }
    }
  }
`;

export const SEARCH_DIAGNOSIS = gql`
  query searchDiagnosis($searchString: String!) {
    searchDiagnosis(searchString: $searchString) {
      name
      id
    }
  }
`;

export const SEARCH_DIAGNOSTIC = gql`
  query searchDiagnostic($searchString: String!) {
    searchDiagnostic(searchString: $searchString) {
      itemname
    }
  }
`;

export const SEARCH_DIAGNOSTICS = gql`
  query searchDiagnostics($searchText: String!, $patientId: String, $city: String) {
    searchDiagnostics(searchText: $searchText, patientId: $patientId, city: $city) {
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

export const GET_AVAILABLE_SLOTS = gql`
  query getDoctorAvailableSlots($DoctorAvailabilityInput: DoctorAvailabilityInput!) {
    getDoctorAvailableSlots(DoctorAvailabilityInput: $DoctorAvailabilityInput) {
      availableSlots
    }
  }
`;

export const GET_DOCTOR_FAVOURITE_TEST_LIST = gql`
  query GetDoctorFavouriteTestList {
    getDoctorFavouriteTestList {
      testList {
        id
        itemname
      }
    }
  }
`;

export const SAVE_DOCTORS_FAVOURITE_MEDICINE = gql`
  mutation SaveDoctorsFavouriteMedicine(
    $saveDoctorsFavouriteMedicineInput: SaveDoctorsFavouriteMedicineInput
  ) {
    saveDoctorsFavouriteMedicine(
      saveDoctorsFavouriteMedicineInput: $saveDoctorsFavouriteMedicineInput
    ) {
      medicineList {
        externalId
        id
        medicineConsumptionDuration
        medicineConsumptionDurationInDays
        medicineConsumptionDurationUnit
        medicineDosage
        medicineFormTypes
        medicineFrequency
        medicineInstructions
        medicineName
        medicineTimings
        medicineToBeTaken
        medicineUnit
        routeOfAdministration
        medicineCustomDosage
      }
    }
  }
`;

export const UPDATE_DOCTOR_FAVOURITE_MEDICINE = gql`
  mutation UpdateDoctorFavouriteMedicine(
    $updateDoctorsFavouriteMedicineInput: UpdateDoctorsFavouriteMedicineInput
  ) {
    updateDoctorFavouriteMedicine(
      updateDoctorsFavouriteMedicineInput: $updateDoctorsFavouriteMedicineInput
    ) {
      medicineList {
        externalId
        id
        medicineConsumptionDuration
        medicineConsumptionDurationInDays
        medicineConsumptionDurationUnit
        medicineDosage
        medicineFormTypes
        medicineFrequency
        medicineInstructions
        medicineName
        medicineTimings
        medicineToBeTaken
        medicineUnit
        routeOfAdministration
        medicineCustomDosage
      }
    }
  }
`;

export const REMOVE_FAVOURITE_MEDICINE = gql`
  mutation RemoveFavouriteMedicine($id: String) {
    removeFavouriteMedicine(id: $id) {
      medicineList {
        externalId
        id
        medicineConsumptionDuration
        medicineConsumptionDurationInDays
        medicineConsumptionDurationUnit
        medicineDosage
        medicineFormTypes
        medicineFrequency
        medicineInstructions
        medicineName
        medicineTimings
        medicineToBeTaken
        medicineUnit
        routeOfAdministration
        medicineCustomDosage
      }
    }
  }
`;

export const ADD_DOCTOR_FAVOURITE_TEST = gql`
  mutation AddDoctorFavouriteTest($itemname: String!) {
    addDoctorFavouriteTest(itemname: $itemname) {
      testList {
        id
        itemname
      }
    }
  }
`;

export const UPDATE_DOCTOR_FAVOURITE_TEST = gql`
  mutation UpdateDoctorFavouriteTest($id: ID!, $itemname: String!) {
    updateDoctorFavouriteTest(id: $id, itemname: $itemname) {
      testList {
        id
        itemname
      }
    }
  }
`;

export const DELETE_DOCTOR_FAVOURITE_TEST = gql`
  mutation DeleteDoctorFavouriteTest($testId: ID!) {
    deleteDoctorFavouriteTest(testId: $testId) {
      testList {
        id
        itemname
      }
    }
  }
`;

export const GET_DOCTOR_FAVOURITE_ADVICE_LIST = gql`
  query GetDoctorFavouriteAdviceList {
    getDoctorFavouriteAdviceList {
      adviceList {
        id
        instruction
      }
    }
  }
`;

export const ADD_DOCTOR_FAVOURITE_ADVICE = gql`
  mutation AddDoctorFavouriteAdvice($instruction: String!) {
    addDoctorFavouriteAdvice(instruction: $instruction) {
      adviceList {
        id
        instruction
      }
    }
  }
`;

export const UPDATE_DOCTOR_FAVOURITE_ADVICE = gql`
  mutation UpdateDoctorFavouriteAdvice($id: ID!, $instruction: String!) {
    updateDoctorFavouriteAdvice(id: $id, instruction: $instruction) {
      adviceList {
        id
        instruction
      }
    }
  }
`;

export const DELETE_DOCTOR_FAVOURITE_ADVICE = gql`
  mutation DeleteDoctorFavouriteAdvice($instructionId: ID!) {
    deleteDoctorFavouriteAdvice(instructionId: $instructionId) {
      adviceList {
        id
        instruction
      }
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
export const DOWNLOAD_DOCUMENT = gql`
  query downloadDocuments($downloadDocumentsInput: DownloadDocumentsInput!) {
    downloadDocuments(downloadDocumentsInput: $downloadDocumentsInput) {
      downloadPaths
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

export const GET_DOCTOR_FAVOURITE_MEDICINE_LIST = gql`
  query GetDoctorFavouriteMedicineList {
    getDoctorFavouriteMedicineList {
      medicineList {
        externalId
        id
        medicineConsumptionDuration
        medicineConsumptionDurationInDays
        medicineConsumptionDurationUnit
        medicineDosage
        medicineFormTypes
        medicineFrequency
        medicineInstructions
        medicineName
        medicineTimings
        medicineToBeTaken
        medicineUnit
        routeOfAdministration
        medicineCustomDosage
      }
      allowedDosages
    }
  }
`;

export const ADD_BLOCKED_CALENDAR_ITEM = gql`
  mutation AddBlockedCalendarItem($doctorId: String!, $start: DateTime!, $end: DateTime!) {
    addBlockedCalendarItem(doctorId: $doctorId, start: $start, end: $end) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const REMOVE_BLOCKED_CALENDAR_ITEM = gql`
  mutation RemoveBlockedCalendarItem($id: Int!) {
    removeBlockedCalendarItem(id: $id) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const BLOCK_MULTIPLE_CALENDAR_ITEMS = gql`
  mutation BlockMultipleCalendarItems($blockCalendarInputs: BlockMultipleItems!) {
    blockMultipleCalendarItems(blockCalendarInputs: $blockCalendarInputs) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const GET_BLOCKED_CALENDAR = gql`
  query GetBlockedCalendar($doctorId: String!) {
    getBlockedCalendar(doctorId: $doctorId) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const SEND_CALL_NOTIFICATION = gql`
  query SendCallNotification(
    $appointmentId: String
    $callType: APPT_CALL_TYPE
    $doctorType: DOCTOR_CALL_TYPE
  ) {
    sendCallNotification(
      appointmentId: $appointmentId
      callType: $callType
      doctorType: $doctorType
    ) {
      status
      callDetails {
        id
      }
    }
  }
`;

export const END_CALL_NOTIFICATION = gql`
  query EndCallNotification($appointmentCallId: String) {
    endCallNotification(appointmentCallId: $appointmentCallId) {
      status
    }
  }
`;

export const UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS = gql`
  mutation UpdatePatientPrescriptionSentStatus($caseSheetId: ID!, $sentToPatient: Boolean!) {
    updatePatientPrescriptionSentStatus(caseSheetId: $caseSheetId, sentToPatient: $sentToPatient) {
      success
      blobName
    }
  }
`;

export const GET_SECRETARY_LIST = gql`
  query getSecretaryList {
    getSecretaryList {
      id
      name
      mobileNumber
      isActive
    }
  }
`;

export const ADD_SECRETARY = gql`
  mutation addSecretary($secretaryId: ID!) {
    addSecretary(secretaryId: $secretaryId) {
      secretary {
        id
        name
      }
    }
  }
`;
export const REMOVE_SECRETARY = gql`
  mutation removeSecretary($secretaryId: ID!) {
    removeSecretary(secretaryId: $secretaryId) {
      id
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

export const MARK_MESSAGE_UNREAD = gql`
  mutation markMessageToUnread($eventId: String) {
    markMessageToUnread(eventId: $eventId) {
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

export const GET_NOTIFICATIONS = gql`
  query getNotifications($toId: String!, $startDate: Date, $endDate: Date) {
    getNotifications(toId: $toId, startDate: $startDate, endDate: $endDate) {
      notificationData {
        appointmentId
        doctorId
        lastUnreadMessageDate
        patientId
        patientFirstName
        patientLastName
        patientPhotoUrl
        unreadNotificationsCount
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
