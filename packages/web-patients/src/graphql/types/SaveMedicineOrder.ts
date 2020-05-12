/* tslint:disable */
/* eslint-disable */
// @generated
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
  orderAutoId: number;
}

export interface SaveMedicineOrder {
  SaveMedicineOrder: SaveMedicineOrder_SaveMedicineOrder;
}

export interface SaveMedicineOrderVariables {
  medicineCartInput?: MedicineCartInput | null;
}
