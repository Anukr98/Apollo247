/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PharmaPaymentStatus
// ====================================================

export interface PharmaPaymentStatus_pharmaPaymentStatus {
  __typename: "PharmaPaymentDetails";
  paymentRefId: string | null;
  amountPaid: number | null;
  paymentStatus: string;
  paymentDateTime: any | null;
}

export interface PharmaPaymentStatus {
  pharmaPaymentStatus: PharmaPaymentStatus_pharmaPaymentStatus | null;
}

export interface PharmaPaymentStatusVariables {
  orderId?: number | null;
}
