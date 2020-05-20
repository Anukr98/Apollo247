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
    }
  }
`;
