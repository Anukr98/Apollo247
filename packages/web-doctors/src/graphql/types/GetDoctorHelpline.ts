/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorHelpline
// ====================================================

export interface GetDoctorHelpline_getDoctorHelpline {
  __typename: "DoctorHelpLine";
  doctorType: DoctorType;
  mobileNumber: string;
}

export interface GetDoctorHelpline {
  getDoctorHelpline: (GetDoctorHelpline_getDoctorHelpline | null)[] | null;
}
