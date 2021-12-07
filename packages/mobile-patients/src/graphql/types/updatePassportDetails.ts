/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PassportDetailsInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updatePassportDetails
// ====================================================

export interface updatePassportDetails_updatePassportDetails {
  __typename: "PassportDetailsResponse";
  status: boolean | null;
  message: string | null;
  displayId: number | null;
  data: string | null;
}

export interface updatePassportDetails {
  updatePassportDetails: (updatePassportDetails_updatePassportDetails | null)[] | null;
}

export interface updatePassportDetailsVariables {
  passportDetailsInput?: (PassportDetailsInput | null)[] | null;
}
