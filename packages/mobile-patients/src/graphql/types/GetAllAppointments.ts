/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DOSE_NUMBER, Gender, VACCINE_TYPE, PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetAllAppointments
// ====================================================

export interface GetAllAppointments_GetAllAppointments_response_patient_info {
  __typename: "PatientInfo";
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  gender: Gender | null;
  uhid: string | null;
}

export interface GetAllAppointments_GetAllAppointments_response_resource_session_details_resource_detail {
  __typename: "ResourceType";
  name: string;
  street_line1: string | null;
  street_line2: string | null;
  street_line3: string | null;
  city: string | null;
  state: string | null;
}

export interface GetAllAppointments_GetAllAppointments_response_resource_session_details {
  __typename: "ResourceSessionType";
  session_name: string | null;
  start_date_time: any;
  vaccine_type: VACCINE_TYPE;
  resource_detail: GetAllAppointments_GetAllAppointments_response_resource_session_details_resource_detail | null;
}

export interface GetAllAppointments_GetAllAppointments_response {
  __typename: "AppointmentType";
  id: string | null;
  dose_number: DOSE_NUMBER;
  resource_id: string;
  patient_info: GetAllAppointments_GetAllAppointments_response_patient_info | null;
  resource_session_details: GetAllAppointments_GetAllAppointments_response_resource_session_details | null;
  display_id: number;
  payment_type: PAYMENT_TYPE;
}

export interface GetAllAppointments_GetAllAppointments {
  __typename: "GetAllAppointmentResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: GetAllAppointments_GetAllAppointments_response[] | null;
}

export interface GetAllAppointments {
  GetAllAppointments: GetAllAppointments_GetAllAppointments;
}
