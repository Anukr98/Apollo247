/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VACCINE_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getResourcesSessionAvailableByDate
// ====================================================

export interface getResourcesSessionAvailableByDate_getResourcesSessionAvailableByDate_response {
  __typename: "ResourceSessionType";
  start_date_time: any;
  end_date_time: any;
  session_name: string | null;
  id: string | null;
}

export interface getResourcesSessionAvailableByDate_getResourcesSessionAvailableByDate {
  __typename: "GetAllResourceSessionResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: getResourcesSessionAvailableByDate_getResourcesSessionAvailableByDate_response[] | null;
}

export interface getResourcesSessionAvailableByDate {
  getResourcesSessionAvailableByDate: getResourcesSessionAvailableByDate_getResourcesSessionAvailableByDate;
}

export interface getResourcesSessionAvailableByDateVariables {
  resource_id: string;
  session_date?: any | null;
  vaccine_type?: VACCINE_TYPE | null;
}
