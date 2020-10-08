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
        dateOfBirth
        emailAddress
      }
    }
  }
`;
export const POST_WEB_ENGAGE = gql`
  mutation PostDoctorConsultEvent($doctorConsultEventInput: DoctorConsultEventInput) {
    postDoctorConsultEvent(doctorConsultEventInput: $doctorConsultEventInput) {
      response {
        status
      }
    }
  }
`;
export const GET_ALL_SPECIALTIES = gql`
  query GetAllSpecialties {
    getAllSpecialties {
      id
      name
      image
      specialistSingularTerm
      specialistPluralTerm
      userFriendlyNomenclature
      displayOrder
    }
  }
`;
export const GET_SET_PARTICIPANTS_STATUS = gql`
  query SetAndGetNumberOfParticipants(
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
export const MAKE_TEAM_DOCTOR_ACTIVE = gql`
  mutation MakeTeamDoctorActive($associatedDoctor: String, $starDoctor: String) {
    makeTeamDoctorActive(associatedDoctor: $associatedDoctor, starDoctor: $starDoctor)
  }
`;

export const UPDATE_DELEGATE_NUMBER = gql`
  mutation UpdateDelegateNumber($delegateNumber: String) {
    updateDelegateNumber(delegateNumber: $delegateNumber) {
      delegateNumber
    }
  }
`;

export const REMOVE_DELEGATE_NUMBER = gql`
  mutation RemoveDelegateNumber {
    removeDelegateNumber {
      delegateNumber
    }
  }
`;

export const REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM = gql`
  mutation RemoveTeamDoctorFromStarTeam($associatedDoctor: String, $starDoctor: String) {
    removeTeamDoctorFromStarTeam(associatedDoctor: $associatedDoctor, starDoctor: $starDoctor) {
      firstName
    }
  }
`;

export const LOGGED_IN_USER_DETAILS = gql`
  query findLoggedinUserDetails {
    findLoggedinUserDetails {
      loggedInUserType
      secretaryDetails {
        name
        doctorSecretary {
          doctor {
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
            onlineConsultationFees
            onlineStatus
            photoUrl
            physicalConsultationFees
            qualification
            registrationNumber
            salutation
            state
            streetLine1
            streetLine2
            streetLine3
            zip
            specialty {
              name
            }
            doctorHospital {
              facility {
                name
                streetLine1
                streetLine2
                streetLine3
                city
              }
            }
          }
        }
        mobileNumber
        isActive
      }
    }
  }
`;

export const GET_DOCTOR_DETAILS = gql`
  query GetDoctorDetails {
    getDoctorDetails {
      isIvrSet
      ivrConsultType
      ivrCallTimeOnline
      ivrCallTimePhysical
      chatDays
      awards
      city
      country
      dateOfBirth
      doctorType
      delegateNumber
      displayName
      emailAddress
      experience
      firebaseToken
      firstName
      fullName
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
      specialization
      state
      streetLine1
      streetLine2
      streetLine3
      zip
      doctorSecretary {
        secretary {
          id
          name
        }
      }
      consultHours {
        actualDay
        consultMode
        startTime
        endTime
        consultType
        weekDay
        consultDuration
      }
      packages {
        name
        fees
      }
      bankAccount {
        accountNumber
        state
        IFSCcode
        accountType
        bankName
        accountHolderName
      }
      specialty {
        name
      }
      doctorHospital {
        facility {
          name
          streetLine1
          streetLine2
          streetLine3
          city
        }
      }
      starTeam {
        isActive
        associatedDoctor {
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
          doctorHospital {
            facility {
              streetLine1
              streetLine2
              streetLine3
              city
            }
          }
          specialty {
            name
          }
        }
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

// export const CREATE_APPOINTMENT_SESSION = gql`
//   mutation CreateAppointmentSession($createAppointmentSessionInput: CreateAppointmentSessionInput) {
//     createAppointmentSession(createAppointmentSessionInput: $createAppointmentSessionInput) {
//       sessionId
//       appointmentToken
//       patientId
//       doctorId
//       appointmentDateTime
//       caseSheetId
//     }
//   }
// `;

export const CREATE_CASESHEET_FOR_JRD = gql`
  mutation CreateJuniorDoctorCaseSheet($appointmentId: String) {
    createJuniorDoctorCaseSheet(appointmentId: $appointmentId) {
      appointment {
        id
        appointmentDateTime
        appointmentDocuments {
          documentPath
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
        medicineUnit
        medicineTimings
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

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($cancelAppointmentInput: CancelAppointmentInput) {
    cancelAppointment(cancelAppointmentInput: $cancelAppointmentInput) {
      status
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
export const GET_DOCTOR_DETAILS_BY_ID = gql`
  query GetDoctorDetailsById($id: String) {
    getDoctorDetailsById(id: $id) {
      awards
      city
      country
      dateOfBirth
      doctorType
      delegateNumber
      emailAddress
      experience
      firebaseToken
      displayName
      firstName
      isActive
      onlineStatus
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
      consultHours {
        consultMode
        startTime
        endTime
        consultType
        weekDay
        actualDay
        consultDuration
      }
      packages {
        name
        fees
      }
      bankAccount {
        accountNumber
        state
        IFSCcode
        accountType
        bankName
        accountHolderName
      }
      specialty {
        name
      }
      doctorHospital {
        facility {
          name
          streetLine1
          streetLine2
          streetLine3
          city
        }
      }
      starTeam {
        isActive
        associatedDoctor {
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
          doctorHospital {
            facility {
              streetLine1
              streetLine2
              streetLine3
              city
            }
          }
          specialty {
            name
          }
        }
      }
    }
  }
`;

export const GET_CASESHEET_JRD = gql`
  query GetJuniorDoctorCaseSheet($appointmentId: String) {
    getJuniorDoctorCaseSheet(appointmentId: $appointmentId) {
      caseSheetDetails {
        id
        doctorId
        status
        referralSpecialtyName
        referralDescription
        appointment {
          id
          appointmentDateTime
          appointmentDocuments {
            documentPath
            prismFileId
          }
          status
          appointmentState
          displayId
          doctorInfo {
            firstName
            lastName
            displayName
            mobileNumber
            specialty {
              name
            }
            photoUrl
            salutation
          }
        }
        medicinePrescription {
          id
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
        consultType
        notes
      }
      allowedDosages
      juniorDoctorCaseSheet {
        createdDate
        createdDoctorProfile {
          firstName
          lastName
        }
        updatedDate
      }
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
          city
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
          diagnosticTestResult
          clinicalObservationNotes
        }
        photoUrl
        uhid
        relation
      }
      pastAppointments {
        id
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
            routeOfAdministration
            medicineCustomDosage
          }
          otherInstructions {
            instruction
          }
        }
      }
      juniorDoctorNotes
    }
  }
`;

export const CREATE_APPOINTMENT_SESSION = gql`
  mutation CreateAppointmentSession($createAppointmentSessionInput: CreateAppointmentSessionInput) {
    createAppointmentSession(createAppointmentSessionInput: $createAppointmentSessionInput) {
      sessionId
      appointmentToken
      patientId
      doctorId
      appointmentDateTime
    }
  }
`;

export const GET_APPOINTMENT_DATA = gql`
  query GetAppointmentData($appointmentId: String!) {
    getAppointmentData(appointmentId: $appointmentId) {
      appointmentsHistory {
        appointmentDateTime
        id
      }
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
export const RESEND_OTP = gql`
  query ResendOtp($mobileNumber: String!, $id: String!, $loginType: LOGIN_TYPE!) {
    resendOtp(mobileNumber: $mobileNumber, id: $id, loginType: $loginType) {
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
    }
  }
`;
export const UPDATE_DOCTOR_ONLINE_STATUS = gql`
  mutation UpdateDoctorOnlineStatus($doctorId: String!, $onlineStatus: DOCTOR_ONLINE_STATUS!) {
    updateDoctorOnlineStatus(doctorId: $doctorId, onlineStatus: $onlineStatus) {
      doctor {
        awards
        city
        country
        dateOfBirth
        doctorType
        delegateNumber
        emailAddress
        experience
        firebaseToken
        displayName
        firstName
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
        specialization
        state
        streetLine1
        streetLine2
        streetLine3
        zip
        onlineStatus
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
          diagnosticTestResult
          clinicalObservationNotes
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
        sentToPatient
        referralSpecialtyName
        referralDescription
        appointment {
          id
          sdConsultationDate
          appointmentType
          appointmentDateTime
          appointmentDocuments {
            documentPath
            prismFileId
          }
          status
          appointmentState
          displayId
          rescheduleCount
          rescheduleCountByDoctor
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
          genericName
          includeGenericNameInPrescription
        }
        removedMedicinePrescription {
          id
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
          testInstruction
        }
        followUp
        followUpDate
        followUpAfterInDays
        followUpConsultType
        consultType
        notes
        version
        prescriptionGeneratedDate
        updatedDate
      }
      pastAppointments {
        id
        appointmentType
        appointmentDateTime
        appointmentState
        doctorId
        hospitalId
        patientId
        parentId
        status
        unreadMessagesCount
        caseSheet {
          version
          sentToPatient
          consultType
          doctorType
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
            id
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
            genericName
            includeGenericNameInPrescription
          }
          otherInstructions {
            instruction
          }
        }
      }
      juniorDoctorNotes
      juniorDoctorCaseSheet {
        createdDate
        createdDoctorProfile {
          firstName
          lastName
          salutation
        }
        updatedDate
      }
    }
  }
`;

export const GET_DOCTOR_FAVOURITE_MEDICINE_LIST = gql`
  query GetDoctorFavouriteMedicineList {
    getDoctorFavouriteMedicineList {
      medicineList {
        medicineConsumptionDurationInDays
        medicineConsumptionDuration
        medicineConsumptionDurationUnit
        medicineFormTypes
        medicineFrequency
        medicineDosage
        medicineUnit
        medicineInstructions
        medicineTimings
        medicineToBeTaken
        medicineName
        id
        externalId
        routeOfAdministration
        medicineCustomDosage
        medicineCustomDetails
        genericName
        includeGenericNameInPrescription
      }
      allowedDosages
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

export const DOWNLOAD_DOCUMENTS = gql`
  query downloadDocuments($downloadDocumentsInput: DownloadDocumentsInput) {
    downloadDocuments(downloadDocumentsInput: $downloadDocumentsInput) {
      downloadPaths
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
        id
      }
    }
  }
`;
export const ADD_DOCTOR_FAVOURITE_TEST = gql`
  mutation AddDoctorFavouriteTest($itemname: String!) {
    addDoctorFavouriteTest(itemname: $itemname) {
      testList {
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
export const UPDATE_DOCTOR_FAVOURITE_MEDICINE = gql`
  mutation UpdateDoctorFavouriteMedicine(
    $updateDoctorsFavouriteMedicineInput: UpdateDoctorsFavouriteMedicineInput
  ) {
    updateDoctorFavouriteMedicine(
      updateDoctorsFavouriteMedicineInput: $updateDoctorsFavouriteMedicineInput
    ) {
      medicineList {
        id
      }
    }
  }
`;

export const UPDATE_DOCTOR_FAVOURITE_TEST = gql`
  mutation UpdateDoctorFavouriteTest($id: ID!, $itemname: String!) {
    updateDoctorFavouriteTest(id: $id, itemname: $itemname) {
      testList {
        id
      }
    }
  }
`;

export const REMOVE_FAVOURITE_MEDICINE = gql`
  mutation RemoveFavouriteMedicine($id: String) {
    removeFavouriteMedicine(id: $id) {
      medicineList {
        id
      }
    }
  }
`;

export const DELETE_DOCTOR_FAVOURITE_TEST = gql`
  mutation DeleteDoctorFavouriteTest($testId: ID!) {
    deleteDoctorFavouriteTest(testId: $testId) {
      testList {
        itemname
      }
    }
  }
`;

export const MODIFY_CASESHEET = gql`
  mutation ModifyCaseSheet($ModifyCaseSheetInput: ModifyCaseSheetInput) {
    modifyCaseSheet(ModifyCaseSheetInput: $ModifyCaseSheetInput) {
      appointment {
        id
        sdConsultationDate
        appointmentDateTime
        appointmentDocuments {
          documentPath
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
        isFollowUp
        followUpParentId
        isTransfer
        transferParentId
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
      }
      consultType
      diagnosis {
        name
      }
      diagnosticPrescription {
        itemname
        testInstruction
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
        medicineName
        medicineDosage
        medicineTimings
        medicineUnit
        medicineInstructions
        medicineConsumptionDuration
        medicineFormTypes
        medicineFrequency
        medicineConsumptionDurationUnit
        routeOfAdministration
        medicineCustomDosage
        medicineCustomDetails
        genericName
        includeGenericNameInPrescription
      }
      removedMedicinePrescription {
        medicineConsumptionDurationInDays
        medicineName
        medicineDosage
        medicineTimings
        medicineUnit
        medicineInstructions
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
    }
  }
`;

export const END_APPOINTMENT_SESSION = gql`
  mutation EndAppointmentSession($endAppointmentSessionInput: EndAppointmentSessionInput) {
    endAppointmentSession(endAppointmentSessionInput: $endAppointmentSessionInput)
  }
`;

export const GET_PATIENT_LOG = gql`
  query GetPatientLog(
    $limit: Int
    $offset: Int
    $sortBy: patientLogSort
    $type: patientLogType
    $patientName: String
  ) {
    getPatientLog(
      limit: $limit
      offset: $offset
      sortBy: $sortBy
      type: $type
      patientName: $patientName
    ) {
      patientLog {
        patientid
        consultscount
        appointmentids
        appointmentdatetime
        patientInfo {
          firstName
          lastName
          dateOfBirth
          id
          emailAddress
          mobileNumber
          gender
          uhid
          photoUrl
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
export const SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME = gql`
  query SearchDoctorAndSpecialtyByName($searchText: String!) {
    SearchDoctorAndSpecialtyByName(searchText: $searchText) {
      doctors {
        id
        salutation
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
export const INITIATE_TRANSFER_APPONITMENT = gql`
  mutation InitiateTransferAppointment($TransferAppointmentInput: TransferAppointmentInput!) {
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
  mutation InitiateRescheduleAppointment($RescheduleAppointmentInput: RescheduleAppointmentInput!) {
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
export const SEARCH_DIAGNOSIS = gql`
  query SearchDiagnosis($searchString: String!) {
    searchDiagnosis(searchString: $searchString) {
      name
      id
    }
  }
`;
export const SEARCH_DIAGNOSTICS = gql`
  query SearchDiagnostics($city: String, $patientId: String, $searchText: String!) {
    searchDiagnostics(city: $city, patientId: $patientId, searchText: $searchText) {
      diagnostics {
        itemName
        itemId
      }
    }
  }
`;
export const UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS = gql`
  mutation UpdatePatientPrescriptionSentStatus(
    $caseSheetId: ID!
    $sentToPatient: Boolean!
    $vitals: Vitals
  ) {
    updatePatientPrescriptionSentStatus(
      caseSheetId: $caseSheetId
      sentToPatient: $sentToPatient
      vitals: $vitals
    ) {
      success
      blobName
      prescriptionGeneratedDate
    }
  }
`;
export const GET_NOTIFICATION = gql`
  query GetNotifications($toId: String!, $startDate: Date, $endDate: Date) {
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
export const MARK_MESSAGE_TO_UNREAD = gql`
  mutation MarkMessageToUnread($eventId: String) {
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
export const GET_SECRETARY_LIST = gql`
  query GetSecretaryList {
    getSecretaryList {
      id
      name
      mobileNumber
      isActive
    }
  }
`;

export const ADD_SECRETARY = gql`
  mutation AddSecretary($secretaryId: ID!) {
    addSecretary(secretaryId: $secretaryId) {
      secretary {
        id
        name
        mobileNumber
      }
    }
  }
`;

export const REMOVE_SECRETARY = gql`
  mutation RemoveSecretary($secretaryId: ID!) {
    removeSecretary(secretaryId: $secretaryId) {
      id
      mobileNumber
    }
  }
`;
export const ADD_CHAT_DOCUMENT = gql`
  mutation AddChatDocument($appointmentId: ID!, $documentPath: String!) {
    addChatDocument(appointmentId: $appointmentId, documentPath: $documentPath) {
      id
      documentPath
    }
  }
`;

export const UPDATE_DOCTOR_CHAT_DAYS = gql`
  mutation UpdateDoctorChatDays($doctorId: String!, $chatDays: Int!) {
    updateDoctorChatDays(doctorId: $doctorId, chatDays: $chatDays) {
      isError
      response
    }
  }
`;

export const SAVE_APPOINTMENT_CALL_FEEDBACK = gql`
  mutation saveAppointmentCallFeedback(
    $saveAppointmentCallFeedback: SaveAppointmentCallFeedbackInput
  ) {
    saveAppointmentCallFeedback(saveAppointmentCallFeedbackInput: $saveAppointmentCallFeedback) {
      id
      appointmentCallDetailsId
      ratingValue
      feedbackResponseType
      feedbackResponses
    }
  }
`;

export const SET_APPOINTMENT_REMINDER_IVR = gql`
  mutation SetAppointmentReminderIvr(
    $doctorId: String!
    $isIvrSet: Boolean
    $ivrConsultType: ConsultMode
    $ivrCallTimeOnline: Int
    $ivrCallTimePhysical: Int
  ) {
    setAppointmentReminderIvr(
      doctorId: $doctorId
      isIvrSet: $isIvrSet
      ivrConsultType: $ivrConsultType
      ivrCallTimeOnline: $ivrCallTimeOnline
      ivrCallTimePhysical: $ivrCallTimePhysical
    ) {
      isError
      response
    }
  }
`;
