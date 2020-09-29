import gql from 'graphql-tag';

export const UPDATE_APPOINTMENT_SESSION = gql`
  mutation UpdateAppointmentSession($UpdateAppointmentSessionInput: UpdateAppointmentSessionInput) {
    updateAppointmentSession(updateAppointmentSessionInput: $UpdateAppointmentSessionInput) {
      sessionId
      appointmentToken
    }
  }
`;

export const ADD_TO_CONSULT_QUEUE = gql`
  mutation AddToConsultQueue($appointmentId: String!) {
    addToConsultQueue(appointmentId: $appointmentId) {
      id
      doctorId
    }
  }
`;

export const GET_APPOINTMENT_DATA = gql`
  query GetAppointmentData($appointmentId: String!) {
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
        isConsultStarted
        symptoms
        caseSheet {
          followUpAfterInDays
          doctorType
        }
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
            name
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

export const CONSULT_COUPONS_LIST = gql`
  query getConsultCouponList {
    getConsultCouponList {
      coupons {
        code
        displayStatus
        couponConsultRule {
          isActive
        }
        createdDate
        description
        id
        isActive
      }
    }
  }
`;

export const GET_CONSULT_PAYMENTS = gql`
  query ConsultOrders($patientId: String) {
    consultOrders(patientId: $patientId) {
      appointments {
        displayId
        id
        appointmentDateTime
        actualAmount
        discountedAmount
        appointmentType
        appointmentPayments {
          amountPaid
          bankTxnId
          id
          paymentRefId
          paymentStatus
          paymentType
          responseMessage
          paymentDateTime
        }
        status
        doctorId
        doctor {
          typeId
          name
        }
      }
    }
  }
`;

export const GET_CONSULT_INVOICE = gql`
  query GetOrderInvoice($patientId: String!, $appointmentId: String!) {
    getOrderInvoice(patientId: $patientId, appointmentId: $appointmentId)
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

export const JOIN_JDQ_WITH_AUTOMATED_QUESTIONS = gql`
  mutation AddToConsultQueueWithAutomatedQuestions($ConsultQueueInput: ConsultQueueInput) {
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
        followUpConsultType
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
      }
      patientDetails {
        id
      }
      juniorDoctorNotes
    }
  }
`;

export const PAST_APPOINTMENTS_COUNT = gql`
  query GetPastAppointmentsCount($doctorId: String!, $patientId: String!, $appointmentId: String!) {
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

export const UPDATE_SAVE_EXTERNAL_CONNECT = gql`
  mutation UpdateSaveExternalConnect(
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

export const GET_APPOINTMENT_DOCTOR_RESCHEDULED_DETAILS = gql`
  query getAppointmentRescheduleDetails($appointmentId: String!) {
    getAppointmentRescheduleDetails(appointmentId: $appointmentId) {
      id
      rescheduleReason
      rescheduledDateTime
      rescheduleInitiatedBy
      rescheduleInitiatedId
      rescheduleStatus
    }
  }
`;
