/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateSaveExternalConnect
// ====================================================

export interface UpdateSaveExternalConnect_updateSaveExternalConnect {
  __typename: "SaveExternalConnectResult";
  status: boolean | null;
}

export interface UpdateSaveExternalConnect {
  updateSaveExternalConnect: UpdateSaveExternalConnect_updateSaveExternalConnect | null;
}

export interface UpdateSaveExternalConnectVariables {
  doctorId: string;
  patientId: string;
  externalConnect?: boolean | null;
  appointmentId: string;
}
