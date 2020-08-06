/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorConsultEventInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PostDoctorConsultEvent
// ====================================================

export interface PostDoctorConsultEvent_postDoctorConsultEvent_response {
  __typename: "WebEngageResponseData";
  status: string;
}

export interface PostDoctorConsultEvent_postDoctorConsultEvent {
  __typename: "WebEngageResponse";
  response: PostDoctorConsultEvent_postDoctorConsultEvent_response;
}

export interface PostDoctorConsultEvent {
  postDoctorConsultEvent: PostDoctorConsultEvent_postDoctorConsultEvent | null;
}

export interface PostDoctorConsultEventVariables {
  doctorConsultEventInput?: DoctorConsultEventInput | null;
}
