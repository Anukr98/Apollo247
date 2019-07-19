/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDoctorAndSpecialty
// ====================================================

export interface SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors {
  __typename: "Doctor";
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  speciality: string | null;
  experience: string | null;
  education: string | null;
  availableForPhysicalConsultation: boolean | null;
  availableForVirtualConsultation: boolean | null;
  photoUrl: string | null;
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
