/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorConsultEventInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: postDoctorConsultEvent
// ====================================================

export interface postDoctorConsultEvent_postDoctorConsultEvent_response {
  __typename: "WebEngageResponseData";
  status: string;
}

export interface postDoctorConsultEvent_postDoctorConsultEvent {
  __typename: "WebEngageResponse";
  response: postDoctorConsultEvent_postDoctorConsultEvent_response;
}

export interface postDoctorConsultEvent {
  postDoctorConsultEvent: postDoctorConsultEvent_postDoctorConsultEvent | null;
}

export interface postDoctorConsultEventVariables {
  doctorConsultEventInput?: DoctorConsultEventInput | null;
}
