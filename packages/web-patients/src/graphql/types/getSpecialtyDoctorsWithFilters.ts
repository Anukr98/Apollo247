/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { filterInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getSpecialtyDoctorsWithFilters
// ====================================================

export interface getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors {
  __typename: "Doctor";
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  speciality: string | null;
  availableForPhysicalConsultation: boolean | null;
  availableForVirtualConsultation: boolean | null;
  education: string | null;
  city: string | null;
  photoUrl: string | null;
}

export interface getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters {
  __typename: "filteredDoctorsResult";
  doctors: (getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors | null)[] | null;
}

export interface getSpecialtyDoctorsWithFilters {
  getSpecialtyDoctorsWithFilters: getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters | null;
}

export interface getSpecialtyDoctorsWithFiltersVariables {
  filterInput?: filterInput | null;
}
