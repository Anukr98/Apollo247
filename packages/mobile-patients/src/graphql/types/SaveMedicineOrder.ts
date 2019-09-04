/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MedicineCartInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveMedicineOrder
// ====================================================

export interface SaveMedicineOrder_SaveMedicineOrder {
  __typename: "SaveMedicineOrderResult";
  errorCode: number | null;
  errorMessage: string | null;
  orderId: string;
}

export interface SaveMedicineOrder {
  SaveMedicineOrder: SaveMedicineOrder_SaveMedicineOrder;
}

export interface SaveMedicineOrderVariables {
  MedicineCartInput: MedicineCartInput;
}
