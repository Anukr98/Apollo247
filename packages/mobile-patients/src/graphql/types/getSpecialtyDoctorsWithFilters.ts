/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { filterInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getSpecialtyDoctorsWithFilters
// ====================================================

export interface getSpecialtyDoctorsWithFilters_getSpecialtyDoctorsWithFilters_doctors {
  __typename: "Doctor";
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  experience: string | null;
  speciality: string;
  specialization: string | null;
  isStarDoctor: boolean;
  education: string;
  services: string | null;
  languages: string | null;
  city: string | null;
  address: string | null;
  photoUrl: string | null;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
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
