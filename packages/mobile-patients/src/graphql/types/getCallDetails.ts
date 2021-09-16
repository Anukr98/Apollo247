/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getCallDetails
// ====================================================

export interface getCallDetails_getCallDetails_appointmentCallDetails {
  __typename: "AppointmentCallDetails";
  id: string;
  callType: string | null;
  doctorType: string | null;
  startTime: any | null;
  endTime: any | null;
  createdDate: any | null;
  updatedDate: any | null;
}

export interface getCallDetails_getCallDetails {
  __typename: "CallDetailsResult";
  appointmentCallDetails: getCallDetails_getCallDetails_appointmentCallDetails | null;
}

export interface getCallDetails {
  getCallDetails: getCallDetails_getCallDetails;
}

export interface getCallDetailsVariables {
  appointmentCallId?: string | null;
}
