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
          id

          medicinePrescription {
            medicineConsumptionDurationInDays
            medicineDosage
            medicineInstructions
            medicineTimings
            medicineToBeTaken
            medicineName
            id
            medicineUnit
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
