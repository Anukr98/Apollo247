/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PrescriptionMedicineInput, MEDICINE_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SavePrescriptionMedicineOrder
// ====================================================

export interface SavePrescriptionMedicineOrder_SavePrescriptionMedicineOrder {
  __typename: "SavePrescriptionMedicineOrderResult";
  status: MEDICINE_ORDER_STATUS;
  orderId: string;
  orderAutoId: number;
  errorCode: number;
  errorMessage: string;
}

export interface SavePrescriptionMedicineOrder {
  SavePrescriptionMedicineOrder: SavePrescriptionMedicineOrder_SavePrescriptionMedicineOrder;
}

export interface SavePrescriptionMedicineOrderVariables {
  prescriptionMedicineInput?: PrescriptionMedicineInput | null;
}
