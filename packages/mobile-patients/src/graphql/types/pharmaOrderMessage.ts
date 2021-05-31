/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: pharmaOrderMessage
// ====================================================

export interface pharmaOrderMessage_pharmaOrderMessage {
  __typename: "PharmaOrderMessageResult";
  message: string | null;
  title: string | null;
}

export interface pharmaOrderMessage {
  pharmaOrderMessage: pharmaOrderMessage_pharmaOrderMessage;
}

export interface pharmaOrderMessageVariables {
  orderId?: number | null;
}
