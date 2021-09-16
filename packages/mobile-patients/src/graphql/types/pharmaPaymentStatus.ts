/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: pharmaPaymentStatus
// ====================================================

export interface pharmaPaymentStatus_pharmaPaymentStatus_planPurchaseDetails {
  __typename: "PLAN_PURCHASE_DETAIL";
  planPurchased: boolean | null;
  totalCashBack: number | null;
  planValidity: any | null;
}

export interface pharmaPaymentStatus_pharmaPaymentStatus {
  __typename: "PharmaPaymentDetails";
  paymentRefId: string | null;
  bankTxnId: string | null;
  amountPaid: number | null;
  paymentStatus: string;
  paymentDateTime: any | null;
  orderDateTime: any;
  paymentMode: string | null;
  planPurchaseDetails: pharmaPaymentStatus_pharmaPaymentStatus_planPurchaseDetails | null;
}

export interface pharmaPaymentStatus {
  pharmaPaymentStatus: pharmaPaymentStatus_pharmaPaymentStatus | null;
}

export interface pharmaPaymentStatusVariables {
  orderId: number;
}
