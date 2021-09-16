/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { docOnCallType } from "./globalTypes";

// ====================================================
// GraphQL query operation: initiateDocOnCall
// ====================================================

export interface initiateDocOnCall_initiateDocOnCall {
  __typename: "ExotelCallFlowResponse";
  success: boolean | null;
}

export interface initiateDocOnCall {
  initiateDocOnCall: initiateDocOnCall_initiateDocOnCall;
}

export interface initiateDocOnCallVariables {
  mobileNumber?: string | null;
  callType?: docOnCallType | null;
}
