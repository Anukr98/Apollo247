/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MedicineOrderCancelOMSInput, MEDICINE_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CancelMedicineOrderOMS
// ====================================================

export interface CancelMedicineOrderOMS_cancelMedicineOrderOMS {
  __typename: "MedicineOrderCancelOMSResult";
  orderStatus: MEDICINE_ORDER_STATUS | null;
}

export interface CancelMedicineOrderOMS {
  cancelMedicineOrderOMS: CancelMedicineOrderOMS_cancelMedicineOrderOMS;
}

export interface CancelMedicineOrderOMSVariables {
  medicineOrderCancelOMSInput?: MedicineOrderCancelOMSInput | null;
}
