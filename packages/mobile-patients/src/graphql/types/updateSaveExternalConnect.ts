/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updateSaveExternalConnect
// ====================================================

export interface updateSaveExternalConnect_updateSaveExternalConnect {
  __typename: "SaveExternalConnectResult";
  status: boolean | null;
}

export interface updateSaveExternalConnect {
  updateSaveExternalConnect: updateSaveExternalConnect_updateSaveExternalConnect | null;
}

export interface updateSaveExternalConnectVariables {
  doctorId: string;
  patientId: string;
  externalConnect?: boolean | null;
  appointmentId: string;
}
