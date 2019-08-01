/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDoctorAndSpecialty
// ====================================================

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors {
  __typename: "Doctor";
  id: string;
  firstName: string;
  lastName: string;
  speciality: string;
  experience: string | null;
  education: string;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  photoUrl: string | null;
  city: string | null;
}

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_specialties {
  __typename: "Specialty";
  name: string | null;
  image: string | null;
}

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty {
  __typename: "SearchDoctorAndSpecialtyResult";
  doctors: (SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors | null)[] | null;
  specialties: (SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_specialties | null)[] | null;
}

export interface SearchDoctorAndSpecialty {
  SearchDoctorAndSpecialty: SearchDoctorAndSpecialty_SearchDoctorAndSpecialty | null;
}

export interface SearchDoctorAndSpecialtyVariables {
  searchText: string;
}
