/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DOSE_NUMBER, Gender, VACCINE_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetAppointmentDetails
// ====================================================

export interface GetAppointmentDetails_GetAppointmentDetails_response_patient_info {
  __typename: "PatientInfo";
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  gender: Gender | null;
  uhid: string | null;
}

export interface GetAppointmentDetails_GetAppointmentDetails_response_resource_session_details_resource_detail {
  __typename: "ResourceType";
  name: string;
  street_line1: string | null;
  street_line2: string | null;
  street_line3: string | null;
  city: string | null;
  state: string | null;
}

export interface GetAppointmentDetails_GetAppointmentDetails_response_resource_session_details {
  __typename: "ResourceSessionType";
  session_name: string | null;
  start_date_time: any;
  vaccine_type: VACCINE_TYPE;
  resource_detail: GetAppointmentDetails_GetAppointmentDetails_response_resource_session_details_resource_detail | null;
}

export interface GetAppointmentDetails_GetAppointmentDetails_response {
  __typename: "AppointmentType";
  display_id: number;
  dose_number: DOSE_NUMBER;
  patient_info: GetAppointmentDetails_GetAppointmentDetails_response_patient_info | null;
  resource_session_details: GetAppointmentDetails_GetAppointmentDetails_response_resource_session_details | null;
}

export interface GetAppointmentDetails_GetAppointmentDetails {
  __typename: "MutateAppointmentResponse";
  message: string | null;
  code: number;
  response: GetAppointmentDetails_GetAppointmentDetails_response | null;
}

export interface GetAppointmentDetails {
  GetAppointmentDetails: GetAppointmentDetails_GetAppointmentDetails;
}

export interface GetAppointmentDetailsVariables {
  appointment_id: string;
}
