/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SavePharmacologistConsultInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: savePharmacologistConsult
// ====================================================

export interface savePharmacologistConsult_savePharmacologistConsult {
  __typename: "SavePharmacologistConsultResult";
  status: boolean | null;
}

export interface savePharmacologistConsult {
  savePharmacologistConsult: savePharmacologistConsult_savePharmacologistConsult;
}

export interface savePharmacologistConsultVariables {
  savePharmacologistConsultInput: SavePharmacologistConsultInput;
}
