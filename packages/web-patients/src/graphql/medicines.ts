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
        applicableDiscount
        couponDiscount
        productDiscount
      }
      pharmaLineItemsWithDiscountedPrice {
        applicableDiscount
        discountedPrice
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
