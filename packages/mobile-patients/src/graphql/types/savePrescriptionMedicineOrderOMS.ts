/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PrescriptionMedicineOrderOMSInput, MEDICINE_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: savePrescriptionMedicineOrderOMS
// ====================================================

export interface savePrescriptionMedicineOrderOMS_savePrescriptionMedicineOrderOMS {
  __typename: "SavePrescriptionMedicineOrderOMSResult";
  status: MEDICINE_ORDER_STATUS;
  orderId: string;
  orderAutoId: number;
  errorCode: number;
  errorMessage: string;
}

export interface savePrescriptionMedicineOrderOMS {
  savePrescriptionMedicineOrderOMS: savePrescriptionMedicineOrderOMS_savePrescriptionMedicineOrderOMS;
}

export interface savePrescriptionMedicineOrderOMSVariables {
  prescriptionMedicineOMSInput?: PrescriptionMedicineOrderOMSInput | null;
}
