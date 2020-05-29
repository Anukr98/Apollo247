import gql from 'graphql-tag';

export const SAVE_MEDICINE_ORDER = gql`
  mutation SaveMedicineOrder($medicineCartInput: MedicineCartInput) {
    SaveMedicineOrder(MedicineCartInput: $medicineCartInput) {
      errorCode
      errorMessage
      orderId
      orderAutoId
    }
  }
`;

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
        orderAutoId
        deliveryType
        currentStatus
        medicineOrdersStatus {
          id
          statusDate
          orderStatus
          hideStatus
        }
        medicineOrderShipments {
          id
          siteId
          siteName
          apOrderNo
          currentStatus
          medicineOrdersStatus {
            id
            statusDate
            hideStatus
            orderStatus
          }
        }
      }
    }
  }
`;

export const GET_MEDICINE_ORDER_OMS_DETAILS = gql`
  query getMedicineOrderOMSDetails($patientId: String, $orderAutoId: Int) {
    getMedicineOrderOMSDetails(patientId: $patientId, orderAutoId: $orderAutoId) {
      medicineOrderDetails {
        id
        orderAutoId
        estimatedAmount
        patientAddressId
        coupon
        devliveryCharges
        prescriptionImageUrl
        prismPrescriptionFileId
        orderTat
        couponDiscount
        productDiscount
        orderType
        currentStatus
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
