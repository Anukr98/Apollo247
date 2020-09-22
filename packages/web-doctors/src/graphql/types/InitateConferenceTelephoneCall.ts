/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { exotelInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: InitateConferenceTelephoneCall
// ====================================================

export interface InitateConferenceTelephoneCall_initateConferenceTelephoneCall {
  __typename: "exotelResult";
  response: string | null;
  isError: boolean | null;
}

export interface InitateConferenceTelephoneCall {
  initateConferenceTelephoneCall: InitateConferenceTelephoneCall_initateConferenceTelephoneCall;
}

export interface InitateConferenceTelephoneCallVariables {
  exotelInput?: exotelInput | null;
}
