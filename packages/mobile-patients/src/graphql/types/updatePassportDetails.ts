/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.


// ====================================================
// GraphQL mutation operation: updatePassportDetails
// ====================================================


export interface updatePassportDetails_updatePassportDetails {
  __typename: "PassportDetailsResponse";
  status: boolean;
  displayId: string | number | null;
  message: string | null;
  data: string | null
}

export interface updatePassportDetails {
  updatePassportDetails: [updatePassportDetails_updatePassportDetails] | null;
}
export interface updatePassportDetails_updatePassportDetailsVariables {
  passportNo: string | null;     
  displayId: number | string | null;
}

export interface updatePassportDetailsVariables {
  passportDetailsInput: updatePassportDetails_updatePassportDetailsVariables
}
