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
  id: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_doctorHospital {
  __typename: "DoctorHospital";
  facility: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_doctorHospital_facility;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_specialty | null;
  specialization: string | null;
  photoUrl: string | null;
  experience: string | null;
  doctorHospital: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_doctorHospital[];
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  image: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName {
  __typename: "SearchDoctorAndSpecialtyByNameResult";
  doctors: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null)[] | null;
  specialties: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties | null)[] | null;
}

export interface SearchDoctorAndSpecialtyByName {
  SearchDoctorAndSpecialtyByName: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName | null;
}

export interface SearchDoctorAndSpecialtyByNameVariables {
  searchText: string;
}
