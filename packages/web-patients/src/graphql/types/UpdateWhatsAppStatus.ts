/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateWhatsAppStatus
// ====================================================

export interface UpdateWhatsAppStatus_updateWhatsAppStatus {
  __typename: "UpdateWhatsAppStatusResult";
  status: boolean | null;
}

export interface UpdateWhatsAppStatus {
  updateWhatsAppStatus: UpdateWhatsAppStatus_updateWhatsAppStatus;
}

export interface UpdateWhatsAppStatusVariables {
  whatsAppMedicine?: boolean | null;
  whatsAppConsult?: boolean | null;
  patientId: string;
}
