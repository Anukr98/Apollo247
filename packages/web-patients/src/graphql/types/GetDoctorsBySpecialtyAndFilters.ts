/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { FilterDoctorInput, ConsultMode, ConsultType, WeekDay } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorsBySpecialtyAndFilters
// ====================================================

export interface GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
}

export interface GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  id: string;
  isActive: boolean;
  startTime: string;
  weekDay: WeekDay;
  endTime: string;
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
  consultHours: (GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_consultHours | null)[] | null;
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
