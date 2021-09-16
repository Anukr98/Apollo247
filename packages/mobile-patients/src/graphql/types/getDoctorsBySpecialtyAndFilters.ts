/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FilterDoctorInput, ConsultMode, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorsBySpecialtyAndFilters
// ====================================================

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  image: string | null;
  userFriendlyNomenclature: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
  facilityType: string;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_doctorHospital {
  __typename: "DoctorHospital";
  facility: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_doctorHospital_facility;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string | null;
  experience: string | null;
  city: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  qualification: string | null;
  specialty: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_specialty | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  languages: string | null;
  consultHours: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_consultHours | null)[] | null;
  doctorType: DoctorType;
  doctorHospital: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_doctorHospital[];
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability {
  __typename: "DoctorConsultModeAvailability";
  doctorId: string | null;
  availableModes: (ConsultMode | null)[] | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
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

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_city {
  __typename: "cityType";
  state: string | null;
  data: (string | null)[] | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_brands {
  __typename: "brandType";
  name: string | null;
  image: string | null;
  brandName: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_language {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_experience {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_availability {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_fee {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_gender {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters {
  __typename: "filters";
  city: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_city | null)[] | null;
  brands: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_brands | null)[] | null;
  language: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_language | null)[] | null;
  experience: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_experience | null)[] | null;
  availability: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_availability | null)[] | null;
  fee: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_fee | null)[] | null;
  gender: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters_gender | null)[] | null;
}

export interface getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters {
  __typename: "FilterDoctorsResult";
  doctors: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[] | null;
  doctorsAvailability: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability | null)[] | null;
  specialty: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty | null;
  doctorsNextAvailability: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability | null)[] | null;
  sort: string | null;
  filters: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_filters | null;
  apolloDoctorCount: number | null;
  partnerDoctorCount: number | null;
}

export interface getDoctorsBySpecialtyAndFilters {
  getDoctorsBySpecialtyAndFilters: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters | null;
}

export interface getDoctorsBySpecialtyAndFiltersVariables {
  filterInput?: FilterDoctorInput | null;
}
