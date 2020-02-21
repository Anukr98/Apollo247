import gql from 'graphql-tag';

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
      }
    }
  }
`;

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
        photoUrl
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

export const CANCEL_APPOINTMENT = gql`
  mutation cancelAppointment($cancelAppointmentInput: CancelAppointmentInput!) {
    cancelAppointment(cancelAppointmentInput: $cancelAppointmentInput) {
      status
    }
  }
`;

export const GET_PATIENT_ADDRESS_LIST = gql`
  query GetPatientAddressList($patientId: String) {
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
          followUpConsultType
          id
          medicinePrescription {
            medicineConsumptionDurationInDays
            medicineDosage
            id
            medicineConsumptionDurationUnit
            medicineFormTypes
            medicineFrequency
            medicineInstructions
            medicineName
            medicineTimings
            medicineToBeTaken
            medicineUnit
          }
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
        displayId
        status
        doctorInfo {
          id
          salutation
          firstName
          lastName
          displayName
          experience
          city
          onlineConsultationFees
          physicalConsultationFees
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

export const GET_MEDICINE_ORDER_DETAILS = gql`
  query GetMedicineOrderDetails($patientId: String, $orderAutoId: Int) {
    getMedicineOrderDetails(patientId: $patientId, orderAutoId: $orderAutoId) {
      MedicineOrderDetails {
        id
        orderAutoId
        devliveryCharges
        estimatedAmount
        prescriptionImageUrl
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
          quantity
          isMedicine
          mou
        }
        medicineOrderPayments {
          paymentType
          amountPaid
          paymentRefId
          paymentStatus
          paymentDateTime
        }
      }
    }
  }
`;

export const SAVE_ORDER_CANCEL_STATUS = gql`
  mutation saveOrderCancelStatus($orderCancelInput: OrderCancelInput) {
    saveOrderCancelStatus(orderCancelInput: $orderCancelInput) {
      requestStatus
      requestMessage
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

export const GET_PATIENT_FUTURE_APPOINTMENT_COUNT = gql`
  query GetPatientFutureAppointmentCount($patientId: String) {
    getPatientFutureAppointmentCount(patientId: $patientId) {
      consultsCount
    }
  }
`;

export const ADD_PROFILE = gql`
  mutation AddNewProfile($PatientProfileInput: PatientProfileInput!) {
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

export const EDIT_PROFILE = gql`
  mutation EditProfile($editProfileInput: EditProfileInput!) {
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

export const DELETE_PROFILE = gql`
  mutation DeleteProfile($patientId: String) {
    deleteProfile(patientId: $patientId) {
      status
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

export const ADD_MEDICAL_RECORD = gql`
  mutation addPatientMedicalRecord($AddMedicalRecordInput: AddMedicalRecordInput) {
    addPatientMedicalRecord(addMedicalRecordInput: $AddMedicalRecordInput) {
      status
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

export const DELETE_PATIENT_MEDICAL_RECORD = gql`
  mutation deletePatientMedicalRecord($recordId: ID!) {
    deletePatientMedicalRecord(recordId: $recordId) {
      status
    }
  }
`;
