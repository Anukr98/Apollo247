/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { exotelInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: initateConferenceTelephoneCall
// ====================================================

export interface initateConferenceTelephoneCall_initateConferenceTelephoneCall {
  __typename: "exotelResult";
  isError: boolean | null;
  from: string | null;
  to: string | null;
  response: string | null;
  errorMessage: string | null;
}

export interface initateConferenceTelephoneCall {
  initateConferenceTelephoneCall: initateConferenceTelephoneCall_initateConferenceTelephoneCall;
}

export interface initateConferenceTelephoneCallVariables {
  exotelInput?: exotelInput | null;
}
