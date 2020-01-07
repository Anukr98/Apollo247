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
          latitude
          longitude
          name
          state
          streetLine1
          streetLine2
          streetLine3
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
      newPatientsList
      appointmentsHistory {
        appointmentType
        doctorId
        status
        hospitalId
        id
        patientId
        appointmentDateTime
        bookingDate
        patientInfo {
          firstName
          lastName
          id
          uhid
          emailAddress
          gender
          dateOfBirth
          relation
        }
      }
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
      consultType
      appointment {
        id
      }
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
      pastAppointments {
        appointmentDateTime
        appointmentState
        doctorId
        hospitalId
        patientId
        parentId
        status
        caseSheet {
          consultType
          appointment {
            id
          }
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
