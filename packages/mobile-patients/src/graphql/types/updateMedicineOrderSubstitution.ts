/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updateMedicineOrderSubstitution
// ====================================================

export interface updateMedicineOrderSubstitution_updateMedicineOrderSubstitution {
  __typename: "medicineOrderSubstitutionResponse";
  message: string | null;
}

export interface updateMedicineOrderSubstitution {
  updateMedicineOrderSubstitution: updateMedicineOrderSubstitution_updateMedicineOrderSubstitution;
}

export interface updateMedicineOrderSubstitutionVariables {
  transactionId?: number | null;
  orderId?: number | null;
  substitution?: string | null;
}
