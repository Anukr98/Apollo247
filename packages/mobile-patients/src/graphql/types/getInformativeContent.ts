/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TestNameInputs } from "./globalTypes";

// ====================================================
// GraphQL query operation: getInformativeContent
// ====================================================

export interface getInformativeContent_getInformativeContent_response {
  __typename: "ContentDataBaseResponse";
  testName: string | null;
  parameterName: string | null;
  loincCode: string | null;
  contentCode: string | null;
}

export interface getInformativeContent_getInformativeContent {
  __typename: "ContentDataResponse";
  errorMsg: string | null;
  response: (getInformativeContent_getInformativeContent_response | null)[] | null;
}

export interface getInformativeContent {
  getInformativeContent: getInformativeContent_getInformativeContent | null;
}

export interface getInformativeContentVariables {
  uhid: string;
  params?: (TestNameInputs | null)[] | null;
}
