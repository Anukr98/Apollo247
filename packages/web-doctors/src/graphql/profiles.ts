import gql from "graphql-tag";

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
export const MAKE_TEAM_DOCTOR_ACTIVE = gql`
  mutation MakeTeamDoctorActive(
    $associatedDoctor: String
    $starDoctor: String
  ) {
    makeTeamDoctorActive(
      associatedDoctor: $associatedDoctor
      starDoctor: $starDoctor
    )
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
  mutation RemoveTeamDoctorFromStarTeam(
    $associatedDoctor: String
    $starDoctor: String
  ) {
    removeTeamDoctorFromStarTeam(
      associatedDoctor: $associatedDoctor
      starDoctor: $starDoctor
    ) {
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
        consultMode
        startTime
        endTime
        consultType
        weekDay
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
      consultHours {
        consultMode
        startTime
        endTime
        consultType
        weekDay
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
        appointment {
          id
          appointmentDateTime
          appointmentDocuments {
            documentPath
          }
          status
          appointmentState
          displayId
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
          }
          followUpDate
          followUpAfterInDays
          followUp
          medicinePrescription {
            medicineName
            medicineTimings
            medicineInstructions
            medicineConsumptionDurationInDays
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
  mutation CreateAppointmentSession(
    $createAppointmentSessionInput: CreateAppointmentSessionInput
  ) {
    createAppointmentSession(
      createAppointmentSessionInput: $createAppointmentSessionInput
    ) {
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

export const GET_CASESHEET = gql`
  query GetCaseSheet($appointmentId: String!) {
    getCaseSheet(appointmentId: $appointmentId) {
      patientDetails {
        id
        allergies
        lifeStyle {
          description
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
        appointment {
          id
          appointmentDateTime
          appointmentDocuments {
            documentPath
          }
          status
          appointmentState
          displayId
        }
        createdDoctorProfile {
          doctorType
          emailAddress
          firstName
          lastName
          salutation
          registrationNumber
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
        followUpConsultType
        consultType
        notes
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
          }
          followUpDate
          followUpAfterInDays
          followUp
          medicinePrescription {
            medicineName
            medicineTimings
            medicineInstructions
            medicineConsumptionDurationInDays
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
      }
    }
  }
`;

export const MODIFY_CASESHEET = gql`
  mutation ModifyCaseSheet($ModifyCaseSheetInput: ModifyCaseSheetInput) {
    modifyCaseSheet(ModifyCaseSheetInput: $ModifyCaseSheetInput) {
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
      status
      sentToPatient
    }
  }
`;

export const END_APPOINTMENT_SESSION = gql`
  mutation EndAppointmentSession(
    $endAppointmentSessionInput: EndAppointmentSessionInput
  ) {
    endAppointmentSession(
      endAppointmentSessionInput: $endAppointmentSessionInput
    )
  }
`;

export const GET_PATIENT_LOG = gql`
  query GetPatientLog(
    $limit: Int
    $offset: Int
    $sortBy: patientLogSort
    $type: patientLogType
  ) {
    getPatientLog(
      limit: $limit
      offset: $offset
      sortBy: $sortBy
      type: $type
    ) {
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
  mutation InitiateTransferAppointment(
    $TransferAppointmentInput: TransferAppointmentInput!
  ) {
    initiateTransferAppointment(
      TransferAppointmentInput: $TransferAppointmentInput
    ) {
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
  mutation InitiateRescheduleAppointment(
    $RescheduleAppointmentInput: RescheduleAppointmentInput!
  ) {
    initiateRescheduleAppointment(
      RescheduleAppointmentInput: $RescheduleAppointmentInput
    ) {
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
export const SEARCH_DIAGNOSTIC = gql`
  query SearchDiagnostic($searchString: String!) {
    searchDiagnostic(searchString: $searchString) {
      itemname
    }
  }
`;
export const UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS = gql`
  mutation UpdatePatientPrescriptionSentStatus(
    $caseSheetId: ID!
    $sentToPatient: Boolean!
  ) {
    updatePatientPrescriptionSentStatus(
      caseSheetId: $caseSheetId
      sentToPatient: $sentToPatient
    ) {
      success
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
        isActive
      }
      doctor {
        city
        country
        doctorType
        delegateNumber
        emailAddress
        experience
        firstName
        fullName
        gender
        id
        lastName
        mobileNumber
        onlineStatus
        photoUrl
        qualification
        salutation
        state
        streetLine1
        streetLine2
        streetLine3
        thumbnailUrl
        displayName
        zip
        registrationNumber
        onlineConsultationFees
        physicalConsultationFees
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
      }
    }
  }
`;

export const REMOVE_SECRETARY = gql`
  mutation RemoveSecretary($secretaryId: ID!) {
    removeSecretary(secretaryId: $secretaryId) {
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
          name
        }
        id
        isActive
        startTime
        weekDay
      }
      doctorHospital {
        facility {
          city
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
      }
      starTeam {
        isActive
        associatedDoctor {
          city
          country
          id
          lastName
          firstName
          fullName
          mobileNumber
          onlineStatus
          qualification
        }
      }
    }
  }
`;
export const ADD_CHAT_DOCUMENT = gql`
  mutation AddChatDocument($appointmentId: ID!, $documentPath: String!) {
    addChatDocument(
      appointmentId: $appointmentId
      documentPath: $documentPath
    ) {
      id
      documentPath
    }
  }
`;
