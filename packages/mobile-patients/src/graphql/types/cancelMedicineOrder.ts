/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MedicineOrderCancelInput, MEDICINE_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: cancelMedicineOrder
// ====================================================

export interface cancelMedicineOrder_cancelMedicineOrder {
  __typename: "MedicineOrderCancelResult";
  orderStatus: MEDICINE_ORDER_STATUS | null;
}

export interface cancelMedicineOrder {
  cancelMedicineOrder: cancelMedicineOrder_cancelMedicineOrder;
}

export interface cancelMedicineOrderVariables {
  medicineOrderCancelInput?: MedicineOrderCancelInput | null;
}
