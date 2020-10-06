/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMedicineOrderCancelReasons
// ====================================================

export interface GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons_cancellationReasons {
  __typename: "MedicineOrderCancelReason";
  reasonCode: string | null;
  description: string | null;
  displayMessage: string | null;
  isUserReason: boolean | null;
}

export interface GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons {
  __typename: "MedicineOrderCancelReasonResult";
  cancellationReasons: (GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons_cancellationReasons | null)[] | null;
}

export interface GetMedicineOrderCancelReasons {
  getMedicineOrderCancelReasons: GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons;
}
