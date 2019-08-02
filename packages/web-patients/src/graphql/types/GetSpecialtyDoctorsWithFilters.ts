/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { filterInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetSpecialtyDoctorsWithFilters
// ====================================================

export interface GetSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors {
  __typename: "Doctor";
  id: string;
  firstName: string;
  lastName: string;
  speciality: string;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  education: string;
  city: string | null;
  photoUrl: string | null;
  experience: string | null;
}

export interface GetSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters {
  __typename: "filteredDoctorsResult";
  doctors: (GetSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors | null)[] | null;
}

export interface GetSpecialtyDoctorsWithFilters {
  getSpecialtyDoctorsWithFilters: GetSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters | null;
}

export interface GetSpecialtyDoctorsWithFiltersVariables {
  filterInput?: filterInput | null;
}
