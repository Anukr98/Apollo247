/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: paymentTransactionStatus
// ====================================================

export interface paymentTransactionStatus_paymentTransactionStatus_appointment {
  __typename: "AppointmentPaymentDetails";
  paymentRefId: string | null;
  displayId: number | null;
  bankTxnId: string | null;
  paymentStatus: string | null;
  amountPaid: number | null;
}

export interface paymentTransactionStatus_paymentTransactionStatus {
  __typename: "AppointmentPaymentResponse";
  appointment: paymentTransactionStatus_paymentTransactionStatus_appointment | null;
}

export interface paymentTransactionStatus {
  paymentTransactionStatus: paymentTransactionStatus_paymentTransactionStatus | null;
}

export interface paymentTransactionStatusVariables {
  appointmentId: string;
}
