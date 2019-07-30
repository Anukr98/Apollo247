/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDoctorAndSpecialty
// ====================================================

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors {
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
  availableIn: string | null;
}

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_specialties {
  __typename: "Specialty";
  id: string | null;
  name: string | null;
  image: string | null;
}

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_possibleMatches_doctors {
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
  availableIn: string | null;
}

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_possibleMatches_specialties {
  __typename: "Specialty";
  id: string | null;
  name: string | null;
  image: string | null;
}

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_possibleMatches {
  __typename: "PossibleMatches";
  doctors: (SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_possibleMatches_doctors | null)[] | null;
  specialties: (SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_possibleMatches_specialties | null)[] | null;
}

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty {
  __typename: "SearchDoctorAndSpecialtyResult";
  doctors: (SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors | null)[] | null;
  specialties: (SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_specialties | null)[] | null;
  possibleMatches: SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_possibleMatches | null;
}

export interface SearchDoctorAndSpecialty {
  SearchDoctorAndSpecialty: SearchDoctorAndSpecialty_SearchDoctorAndSpecialty | null;
}

export interface SearchDoctorAndSpecialtyVariables {
  searchText: string;
}
