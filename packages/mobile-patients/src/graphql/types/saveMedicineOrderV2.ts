/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SaveMedicineOrderV2Input } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveMedicineOrderV2
// ====================================================

export interface saveMedicineOrderV2_saveMedicineOrderV2_orders {
  __typename: "MedicineOrderIds";
  id: string;
  orderAutoId: number | null;
  estimatedAmount: number | null;
}

export interface saveMedicineOrderV2_saveMedicineOrderV2 {
  __typename: "SaveMedicineOrderV2Result";
  errorCode: number | null;
  errorMessage: string | null;
  transactionId: number | null;
  orders: (saveMedicineOrderV2_saveMedicineOrderV2_orders | null)[] | null;
}

export interface saveMedicineOrderV2 {
  saveMedicineOrderV2: saveMedicineOrderV2_saveMedicineOrderV2;
}

export interface saveMedicineOrderV2Variables {
  medicineOrderInput: SaveMedicineOrderV2Input;
}
