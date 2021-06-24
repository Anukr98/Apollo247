/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DOSE_NUMBER, Gender, APPOINTMENT_STATUS, PAYMENT_TYPE, VACCINE_TYPE } from "./globalTypes";

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
  id: string | null;
  mobileNumber: string | null;
}

export interface GetAppointmentDetails_GetAppointmentDetails_response_resource_session_details_resource_detail {
  __typename: "ResourceType";
  name: string;
  street_line1: string | null;
  street_line2: string | null;
  street_line3: string | null;
  city: string | null;
  state: string | null;
  is_corporate_site: boolean | null;
}

export interface GetAppointmentDetails_GetAppointmentDetails_response_resource_session_details {
  __typename: "ResourceSessionType";
  session_name: string | null;
  start_date_time: any;
  vaccine_type: VACCINE_TYPE;
  station_name: string | null;
  resource_detail: GetAppointmentDetails_GetAppointmentDetails_response_resource_session_details_resource_detail | null;
}

export interface GetAppointmentDetails_GetAppointmentDetails_response {
  __typename: "AppointmentType";
  id: string | null;
  display_id: number;
  dose_number: DOSE_NUMBER;
  patient_info: GetAppointmentDetails_GetAppointmentDetails_response_patient_info | null;
  status: APPOINTMENT_STATUS;
  payment_type: PAYMENT_TYPE;
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
