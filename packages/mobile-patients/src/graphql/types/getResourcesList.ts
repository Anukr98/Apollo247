/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VACCINE_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getResourcesList
// ====================================================

export interface getResourcesList_getResourcesList_response {
  __typename: "ResourceType";
  id: string | null;
  name: string;
  created_at: any | null;
  city: string | null;
  is_corporate_site: boolean | null;
  street_line1: string | null;
  street_line2: string | null;
  street_line3: string | null;
}

export interface getResourcesList_getResourcesList {
  __typename: "GetAllResourceResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: getResourcesList_getResourcesList_response[] | null;
}

export interface getResourcesList {
  getResourcesList: getResourcesList_getResourcesList;
}

export interface getResourcesListVariables {
  city: string;
  vaccine_type?: VACCINE_TYPE | null;
}
