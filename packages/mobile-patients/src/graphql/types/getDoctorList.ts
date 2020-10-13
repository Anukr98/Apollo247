/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FilterDoctorInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorList
// ====================================================

export interface getDoctorList_getDoctorList {
  __typename: "DoctorListResult";
  doctors: (any | null)[] | null;
  apolloDoctorCount: number | null;
  partnerDoctorCount: number | null;
}

export interface getDoctorList {
  getDoctorList: getDoctorList_getDoctorList | null;
}

export interface getDoctorListVariables {
  filterInput?: FilterDoctorInput | null;
}
