/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { FilterDoctorInput, Salutation, ConsultMode } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorsBySpecialtyAndFilters
// ====================================================

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_specialty {
  __typename: "DoctorSpecialties";
  name: string;
  image: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  experience: string | null;
  city: string | null;
  photoUrl: string | null;
  qualification: string | null;
  specialty: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_specialty | null;
  onlineConsultationFees: string;
  languages: string | null;
  consultHours: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_consultHours | null)[] | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability {
  __typename: "DoctorConsultModeAvailability";
  doctorId: string | null;
  availableModes: (ConsultMode | null)[] | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty {
  __typename: "DoctorSpecialty";
  specialistSingularTerm: string | null;
  specialistPluralTerm: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability {
  __typename: "DoctorSlotAvailability";
  doctorId: string | null;
  onlineSlot: string | null;
  physicalSlot: string | null;
  referenceSlot: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters {
  __typename: "FilterDoctorsResult";
  doctors: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[] | null;
  doctorsAvailability: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability | null)[] | null;
  specialty: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty | null;
  doctorsNextAvailability: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability | null)[] | null;
}

export interface getDoctorsBySpecialtyAndFilters {
  getDoctorsBySpecialtyAndFilters: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters | null;
}

export interface getDoctorsBySpecialtyAndFiltersVariables {
  filterInput?: FilterDoctorInput | null;
}
