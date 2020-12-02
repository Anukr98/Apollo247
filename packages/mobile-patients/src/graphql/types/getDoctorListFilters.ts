/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDoctorListFilters
// ====================================================

export interface getDoctorListFilters_getDoctorListFilters_filters_city {
  __typename: "cityType";
  state: string | null;
  data: (string | null)[] | null;
}

export interface getDoctorListFilters_getDoctorListFilters_filters_brands {
  __typename: "brandType";
  name: string | null;
  image: string | null;
  brandName: string | null;
}

export interface getDoctorListFilters_getDoctorListFilters_filters_language {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorListFilters_getDoctorListFilters_filters_experience {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorListFilters_getDoctorListFilters_filters_availability {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorListFilters_getDoctorListFilters_filters_fee {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorListFilters_getDoctorListFilters_filters_gender {
  __typename: "DefaultfilterType";
  name: string | null;
}

export interface getDoctorListFilters_getDoctorListFilters_filters {
  __typename: "filters";
  city: (getDoctorListFilters_getDoctorListFilters_filters_city | null)[] | null;
  brands: (getDoctorListFilters_getDoctorListFilters_filters_brands | null)[] | null;
  language: (getDoctorListFilters_getDoctorListFilters_filters_language | null)[] | null;
  experience: (getDoctorListFilters_getDoctorListFilters_filters_experience | null)[] | null;
  availability: (getDoctorListFilters_getDoctorListFilters_filters_availability | null)[] | null;
  fee: (getDoctorListFilters_getDoctorListFilters_filters_fee | null)[] | null;
  gender: (getDoctorListFilters_getDoctorListFilters_filters_gender | null)[] | null;
}

export interface getDoctorListFilters_getDoctorListFilters {
  __typename: "DoctorsFiltersResult";
  filters: getDoctorListFilters_getDoctorListFilters_filters | null;
}

export interface getDoctorListFilters {
  getDoctorListFilters: getDoctorListFilters_getDoctorListFilters | null;
}
