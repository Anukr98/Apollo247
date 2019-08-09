/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { FilterDoctorInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorsBySpecialtyAndFilters
// ====================================================

export interface GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
}

export interface GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors {
  __typename: "DoctorDetails";
  id: string;
  firstName: string;
  lastName: string;
  specialty: GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_specialty;
  experience: string | null;
  photoUrl: string | null;
  qualification: string | null;
}

export interface GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters {
  __typename: "FilterDoctorsResult";
  doctors: (GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[] | null;
}

export interface GetDoctorsBySpecialtyAndFilters {
  getDoctorsBySpecialtyAndFilters: GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters | null;
}

export interface GetDoctorsBySpecialtyAndFiltersVariables {
  filterInput?: FilterDoctorInput | null;
}
