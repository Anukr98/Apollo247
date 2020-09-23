/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FilterDoctorInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorList
// ====================================================

export interface GetDoctorList_getDoctorList_specialties {
  __typename: "Specialty";
  id: string | null;
  name: string | null;
  specialtydisplayName: string | null;
}

export interface GetDoctorList_getDoctorList {
  __typename: "DoctorListResult";
  doctors: (any | null)[] | null;
  specialties: (GetDoctorList_getDoctorList_specialties | null)[] | null;
  apolloDoctorCount: number | null;
  partnerDoctorCount: number | null;
}

export interface GetDoctorList {
  getDoctorList: GetDoctorList_getDoctorList | null;
}

export interface GetDoctorListVariables {
  filterInput?: FilterDoctorInput | null;
}
