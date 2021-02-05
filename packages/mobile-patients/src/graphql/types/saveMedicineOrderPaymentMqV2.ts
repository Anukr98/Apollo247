/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MedicinePaymentMqV2Input } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveMedicineOrderPaymentMqV2
// ====================================================

export interface saveMedicineOrderPaymentMqV2_saveMedicineOrderPaymentMqV2 {
  __typename: "SaveMedicineOrderPaymentMqV2Result";
  errorCode: number | null;
  errorMessage: string | null;
}

export interface saveMedicineOrderPaymentMqV2 {
  saveMedicineOrderPaymentMqV2: saveMedicineOrderPaymentMqV2_saveMedicineOrderPaymentMqV2;
}

export interface saveMedicineOrderPaymentMqV2Variables {
  medicinePaymentMqInput: MedicinePaymentMqV2Input;
}
