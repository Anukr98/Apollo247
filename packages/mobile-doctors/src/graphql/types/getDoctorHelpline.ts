/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorHelpline
// ====================================================

export interface getDoctorHelpline_getDoctorHelpline {
  __typename: "DoctorHelpLine";
  doctorType: DoctorType;
  mobileNumber: string;
}

export interface getDoctorHelpline {
  getDoctorHelpline: (getDoctorHelpline_getDoctorHelpline | null)[] | null;
}
