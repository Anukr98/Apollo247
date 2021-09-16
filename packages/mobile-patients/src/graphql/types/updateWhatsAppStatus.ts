/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updateWhatsAppStatus
// ====================================================

export interface updateWhatsAppStatus_updateWhatsAppStatus {
  __typename: "UpdateWhatsAppStatusResult";
  status: boolean | null;
}

export interface updateWhatsAppStatus {
  updateWhatsAppStatus: updateWhatsAppStatus_updateWhatsAppStatus;
}

export interface updateWhatsAppStatusVariables {
  whatsAppMedicine?: boolean | null;
  whatsAppConsult?: boolean | null;
  patientId: string;
}
