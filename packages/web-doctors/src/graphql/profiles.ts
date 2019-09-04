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
export const GET_DOCTOR_PROFILE = gql`
  query GetDoctorProfile {
    getDoctorProfile {
      profile {
        id
        salutation
        firstName
        lastName
        mobileNumber
        experience
        speciality
        specialization
        isStarDoctor
        education
        services
        languages
        city
        awards
        photoUrl
        registrationNumber
        isProfileComplete
        availableForPhysicalConsultation
        availableForVirtualConsultation
        onlineConsultationFees
        physicalConsultationFees
        package
        inviteStatus
      }
      paymentDetails {
        accountNumber
        address
      }
      clinics {
        name
        addressLine1
        addressLine2
        addressLine3
        city
      }
      starDoctorTeam {
        firstName
        lastName
        experience
        inviteStatus
      }
      consultationHours {
        days
        startTime
        endTime
        availableForPhysicalConsultation
        availableForVirtualConsultation
        type
      }
    }
  }
`;
export const REMOVE_STAR_DOCTOR = gql`
  mutation RemoveDoctorFromStarDoctorProgram($starDoctorId: String!, $doctorId: String!) {
    removeDoctorFromStarDoctorProgram(starDoctorId: $starDoctorId, doctorId: $doctorId)
  }
`;
export const GET_DOCTOR_FOR_STAR_DOCTOR_PROGRAM = gql`
  query GetDoctorsForStarDoctorProgram($searchString: String!) {
    getDoctorsForStarDoctorProgram(searchString: $searchString) {
      profile {
        id
        firstName
        lastName
        inviteStatus
        experience
      }
      starDoctorTeam {
        id
        firstName
        lastName
        inviteStatus
        experience
      }
    }
  }
`;
export const ADD_DOCTOR_TO_STAR_PROGRAM = gql`
  mutation AddDoctorToStarDoctorProgram($starDoctorId: String!, $doctorId: String!) {
    addDoctorToStarDoctorProgram(starDoctorId: $starDoctorId, doctorId: $doctorId)
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

export const CREATE_APPOINTMENT_SESSION = gql`
  mutation CreateAppointmentSession($createAppointmentSessionInput: CreateAppointmentSessionInput) {
    createAppointmentSession(createAppointmentSessionInput: $createAppointmentSessionInput) {
      sessionId
      appointmentToken
      patientId
      doctorId
      appointmentDateTime
      caseSheetId
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
          name
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
        appointment {
          id
          appointmentDateTime
        }
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
          name
        }
        followUp
        followUpDate
        followUpAfterInDays
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
            name
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
    }
  }
`;

export const UPDATE_CASESHEET = gql`
  mutation UpdateCaseSheet($UpdateCaseSheetInput: UpdateCaseSheetInput) {
    updateCaseSheet(UpdateCaseSheetInput: $UpdateCaseSheetInput) {
      consultType
      appointment {
        id
      }
      diagnosis {
        name
      }
      diagnosticPrescription {
        name
      }
      doctorId
      followUp
      followUpAfterInDays
      followUpDate
      id
      medicinePrescription {
        medicineConsumptionDurationInDays
        medicineName
        medicineDosage
        medicineTimings
        medicineInstructions
      }
      notes
      patientId
      symptoms {
        symptom
        since
        howOften
        severity
      }
      otherInstructions {
        instruction
      }
    }
  }
`;
export const END_APPOINTMENT_SESSION = gql`
  mutation EndAppointmentSession($endAppointmentSessionInput: EndAppointmentSessionInput) {
    endAppointmentSession(endAppointmentSessionInput: $endAppointmentSessionInput)
  }
`;
export const GET_PATIENT_LOG = gql`
  query GetPatientLog($limit: Int, $offset: Int, $sortBy: patientLogSort, $type: patientLogType) {
    getPatientLog(limit: $limit, offset: $offset, sortBy: $sortBy, type: $type) {
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
export const SEARCH_DOCTOR_AND_SPECIALITY = gql`
  query SearchDoctorAndSpecialty($searchText: String!) {
    SearchDoctorAndSpecialty(searchText: $searchText) {
      doctors {
        firstName
        lastName
        services
        speciality
        specialization
        id
        photoUrl
      }
      specialties {
        id
        name
        image
      }
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
