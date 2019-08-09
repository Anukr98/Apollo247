/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDoctorAndSpecialtyByName
// ====================================================

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors {
  __typename: "DoctorDetails";
  id: string;
  firstName: string;
  lastName: string;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_specialty;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties {
  __typename: "DoctorSpecialty";
  name: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors {
  __typename: "DoctorDetails";
  firstName: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_specialties {
  __typename: "DoctorSpecialty";
  name: string;
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
  firstName: string;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_specialty;
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
