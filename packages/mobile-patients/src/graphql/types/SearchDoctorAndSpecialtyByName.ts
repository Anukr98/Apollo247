/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Salutation } from "./globalTypes";

// ====================================================
// GraphQL query operation: SearchDoctorAndSpecialtyByName
// ====================================================

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  experience: string | null;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_specialty | null;
  specialization: string | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  image: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  experience: string | null;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors_specialty | null;
  specialization: string | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_specialties {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  image: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches {
  __typename: "PossibleSearchMatches";
  doctors: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors | null)[] | null;
  specialties: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_specialties | null)[] | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_specialty {
  __typename: "DoctorSpecialties";
  name: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  experience: string | null;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_specialty | null;
  specialization: string | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName {
  __typename: "SearchDoctorAndSpecialtyByNameResult";
  doctors: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null)[] | null;
  specialties: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties | null)[] | null;
  possibleMatches: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches | null;
  otherDoctors: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors | null)[] | null;
}

export interface SearchDoctorAndSpecialtyByName {
  SearchDoctorAndSpecialtyByName: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName | null;
}

export interface SearchDoctorAndSpecialtyByNameVariables {
  searchText: string;
}
