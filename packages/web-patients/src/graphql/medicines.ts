import gql from 'graphql-tag';

export const SAVE_MEDICINE_ORDER_OMS = gql`
  mutation saveMedicineOrderOMS($medicineCartOMSInput: MedicineCartOMSInput) {
    saveMedicineOrderOMS(medicineCartOMSInput: $medicineCartOMSInput) {
      errorCode
      errorMessage
      orderId
      orderAutoId
    }
  }
`;

export const SAVE_MEDICINE_ORDER_PAYMENT_RESULT = gql`
  mutation SaveMedicineOrderPayment($medicinePaymentInput: MedicinePaymentInput) {
    SaveMedicineOrderPayment(medicinePaymentInput: $medicinePaymentInput) {
      errorCode
      errorMessage
      paymentOrderId
      orderStatus
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

export const PHRAMA_COUPONS_LIST = gql`
  query getPharmaCouponList {
    getPharmaCouponList {
      coupons {
        code
        couponPharmaRule {
          couponCategoryApplicable
          discountApplicableOn
          messageOnCouponScreen
          successMessage
        }
        displayStatus
        createdDate
        description
        id
        isActive
      }
    }
  }
`;

export const VALIDATE_PHARMA_COUPONS = gql`
  query validatePharmaCoupon($pharmaCouponInput: PharmaCouponInput) {
    validatePharmaCoupon(pharmaCouponInput: $pharmaCouponInput) {
      discountedTotals {
        couponDiscount
        productDiscount
        mrpPriceTotal
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

export const GET_PHARMACY_PAYMENTS = gql`
  query PharmacyOrders($patientId: String) {
    pharmacyOrders(patientId: $patientId) {
      pharmaOrders {
        id
        bookingSource
        devliveryCharges
        estimatedAmount
        orderAutoId
        appointmentId
        currentStatus
        orderType
        quoteDateTime
        orderDateTime
        medicineOrderPayments {
          paymentStatus
          paymentRefId
          paymentType
          amountPaid
          paymentDateTime
          paymentMode
        }
      }
    }
  }
`;

export const PHRAMA_PAYMENT_STATUS = gql`
  query PharmaPaymentStatus($orderId: Int) {
    pharmaPaymentStatus(orderId: $orderId) {
      paymentRefId
      bankTxnId
      amountPaid
      paymentStatus
      paymentDateTime
      paymentMode
      orderDateTime
    }
  }
`;

export const CANCEL_MEDICINE_ORDER = gql`
  mutation CancelMedicineOrderOMS($medicineOrderCancelOMSInput: MedicineOrderCancelOMSInput) {
    cancelMedicineOrderOMS(medicineOrderCancelOMSInput: $medicineOrderCancelOMSInput) {
      orderStatus
    }
  }
`;

export const MEDICINE_ORDER_CANCEL_REASONS = gql`
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

export const GET_MEDICINE_ORDERS_OMS_LIST = gql`
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
        medicineOrdersStatus {
          id
          statusDate
          orderStatus
          hideStatus
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
        orderType
        shopAddress
        packagingCharges
        deliveryType
        currentStatus
        patientAddressId
        alertStore
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
          name
          mobileNumber
        }
      }
    }
  }
`;

export const ADD_PATIENT_FEEDBACK = gql`
  mutation addPatientFeedback($patientFeedbackInput: PatientFeedbackInput!) {
    addPatientFeedback(patientFeedbackInput: $patientFeedbackInput) {
      status
    }
  }
`;

export const SAVE_PHARMACOLOGIST_CONSULT = gql`
  mutation savePharmacologistConsult(
    $savePharmacologistConsultInput: SavePharmacologistConsultInput!
  ) {
    savePharmacologistConsult(savePharmacologistConsultInput: $savePharmacologistConsultInput) {
      status
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

export const GET_ONE_APOLLO = gql`
  query GetOneApollo($patientId: String) {
    getOneApolloUser(patientId: $patientId) {
      availableHC
      name
      earnedHC
      tier
      burnedCredits
      blockedCredits
    }
  }
`;

