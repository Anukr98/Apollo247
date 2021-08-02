/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: pharmaPaymentStatusV2
// ====================================================

export interface pharmaPaymentStatusV2_pharmaPaymentStatusV2_planPurchaseDetails {
  __typename: "PLAN_PURCHASE_DETAIL";
  planPurchased: boolean | null;
  totalCashBack: number | null;
  planValidity: any | null;
}

export interface pharmaPaymentStatusV2_pharmaPaymentStatusV2 {
  __typename: "PharmaPaymentDetails";
  paymentRefId: string | null;
  bankTxnId: string | null;
  amountPaid: number | null;
  paymentStatus: string;
  paymentDateTime: any | null;
  paymentMode: string | null;
  isSubstitution: boolean | null;
  substitutionTime: number | null;
  substitutionMessage: string | null;
  planPurchaseDetails: pharmaPaymentStatusV2_pharmaPaymentStatusV2_planPurchaseDetails | null;
}

export interface pharmaPaymentStatusV2 {
  pharmaPaymentStatusV2: pharmaPaymentStatusV2_pharmaPaymentStatusV2 | null;
}

export interface pharmaPaymentStatusV2Variables {
  transactionId: number;
}
