/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PaymentTransactionStatus
// ====================================================

export interface PaymentTransactionStatus_paymentTransactionStatus_appointment {
  __typename: "AppointmentPaymentDetails";
  amountPaid: number | null;
  paymentRefId: string | null;
  bankTxnId: string | null;
  displayId: number | null;
  responseMessage: string | null;
  paymentDateTime: any | null;
  paymentStatus: string | null;
}

export interface PaymentTransactionStatus_paymentTransactionStatus {
  __typename: "AppointmentPaymentResponse";
  appointment: PaymentTransactionStatus_paymentTransactionStatus_appointment | null;
}

export interface PaymentTransactionStatus {
  paymentTransactionStatus: PaymentTransactionStatus_paymentTransactionStatus | null;
}

export interface PaymentTransactionStatusVariables {
  appointmentId: string;
}
