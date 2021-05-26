/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VACCINE_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getResourcesSessionAvailableDate
// ====================================================

export interface getResourcesSessionAvailableDate_getResourcesSessionAvailableDate {
  __typename: "sessionDateResponseType";
  code: number;
  success: boolean;
  message: string | null;
  response: string[] | null;
}

export interface getResourcesSessionAvailableDate {
  getResourcesSessionAvailableDate: getResourcesSessionAvailableDate_getResourcesSessionAvailableDate;
}

export interface getResourcesSessionAvailableDateVariables {
  resource_id: string;
  vaccine_type?: VACCINE_TYPE | null;
}
