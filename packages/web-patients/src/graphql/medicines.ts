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
      orderAutoId
    }
  }
`;
