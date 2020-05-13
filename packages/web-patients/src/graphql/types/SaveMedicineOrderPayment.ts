/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MedicinePaymentInput, MEDICINE_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveMedicineOrderPayment
// ====================================================

export interface SaveMedicineOrderPayment_SaveMedicineOrderPayment {
  __typename: "SaveMedicineOrderPaymentResult";
  errorCode: number | null;
  errorMessage: string | null;
  paymentOrderId: string;
  orderStatus: MEDICINE_ORDER_STATUS | null;
}

export interface SaveMedicineOrderPayment {
  SaveMedicineOrderPayment: SaveMedicineOrderPayment_SaveMedicineOrderPayment;
}

export interface SaveMedicineOrderPaymentVariables {
  medicinePaymentInput?: MedicinePaymentInput | null;
}
