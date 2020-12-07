/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MedicineCartOMSInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveMedicineOrderOMS
// ====================================================

export interface saveMedicineOrderOMS_saveMedicineOrderOMS {
  __typename: "SaveMedicineOrderResult";
  errorCode: number | null;
  errorMessage: string | null;
  orderId: string;
  orderAutoId: number;
}

export interface saveMedicineOrderOMS {
  saveMedicineOrderOMS: saveMedicineOrderOMS_saveMedicineOrderOMS;
}

export interface saveMedicineOrderOMSVariables {
  medicineCartOMSInput: MedicineCartOMSInput;
}
