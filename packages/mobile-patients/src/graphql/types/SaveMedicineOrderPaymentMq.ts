/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MedicinePaymentMqInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveMedicineOrderPaymentMq
// ====================================================

export interface SaveMedicineOrderPaymentMq_SaveMedicineOrderPaymentMq {
  __typename: "SaveMedicineOrderPaymentMqResult";
  errorCode: number | null;
  errorMessage: string | null;
}

export interface SaveMedicineOrderPaymentMq {
  SaveMedicineOrderPaymentMq: SaveMedicineOrderPaymentMq_SaveMedicineOrderPaymentMq;
}

export interface SaveMedicineOrderPaymentMqVariables {
  medicinePaymentMqInput: MedicinePaymentMqInput;
}
