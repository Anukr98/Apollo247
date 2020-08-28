/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: pharmaPaymentStatus
// ====================================================

export interface pharmaPaymentStatus_pharmaPaymentStatus {
  __typename: "PharmaPaymentDetails";
  paymentRefId: string | null;
  bankTxnId: string | null;
  amountPaid: number | null;
  paymentStatus: string;
  paymentDateTime: any | null;
  orderDateTime: any;
  paymentMode: string | null;
}

export interface pharmaPaymentStatus {
  pharmaPaymentStatus: pharmaPaymentStatus_pharmaPaymentStatus | null;
}

export interface pharmaPaymentStatusVariables {
  orderId: number;
}
