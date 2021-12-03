/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SaveMedicineOrderV3Input } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveMedicineOrderV3
// ====================================================

export interface saveMedicineOrderV3_saveMedicineOrderV3_data_orders {
  __typename: "SaveMedicineOrdersResult";
  id: string | null;
  orderAutoId: number | null;
  estimatedAmount: number | null;
}

export interface saveMedicineOrderV3_saveMedicineOrderV3_data {
  __typename: "SaveMedicineOrderV3Response";
  transactionId: number | null;
  orders: (saveMedicineOrderV3_saveMedicineOrderV3_data_orders | null)[] | null;
  isSubstitution: boolean | null;
  substitutionTime: number | null;
  substitutionMessage: string | null;
  isCodEligible: boolean | null;
  codMessage: string | null;
  paymentOrderId: string | null;
}

export interface saveMedicineOrderV3_saveMedicineOrderV3 {
  __typename: "SaveMedicineOrderV3Result";
  errorCode: number | null;
  errorMessage: string | null;
  data: saveMedicineOrderV3_saveMedicineOrderV3_data | null;
}

export interface saveMedicineOrderV3 {
  saveMedicineOrderV3: saveMedicineOrderV3_saveMedicineOrderV3;
}

export interface saveMedicineOrderV3Variables {
  medicineOrderInput?: SaveMedicineOrderV3Input | null;
}
