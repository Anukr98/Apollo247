/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Geolocation, DoctorType } from "./globalTypes";

// ====================================================
// GraphQL query operation: SearchDoctorAndSpecialtyByName
// ====================================================

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
  facilityType: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_doctorHospital {
  __typename: "DoctorHospital";
  facility: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_doctorHospital_facility;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_specialty | null;
  specialization: string | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  doctorType: DoctorType;
  doctorHospital: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors_doctorHospital[];
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability {
  __typename: "DoctorSlotAvailability";
  doctorId: string | null;
  onlineSlot: string | null;
  physicalSlot: string | null;
  referenceSlot: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  image: string | null;
  userFriendlyNomenclature: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
  facilityType: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors_doctorHospital {
  __typename: "DoctorHospital";
  facility: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors_doctorHospital_facility;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors_specialty | null;
  specialization: string | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  doctorType: DoctorType;
  doctorHospital: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors_doctorHospital[];
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctorsNextAvailability {
  __typename: "DoctorSlotAvailability";
  doctorId: string | null;
  onlineSlot: string | null;
  physicalSlot: string | null;
  referenceSlot: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_specialties {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  image: string | null;
  userFriendlyNomenclature: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches {
  __typename: "PossibleSearchMatches";
  doctors: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors | null)[] | null;
  doctorsNextAvailability: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctorsNextAvailability | null)[] | null;
  specialties: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_specialties | null)[] | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
  facilityType: string;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_doctorHospital {
  __typename: "DoctorHospital";
  facility: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_doctorHospital_facility;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors {
  __typename: "DoctorDetails";
  id: string;
  salutation: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  fullName: string | null;
  experience: string | null;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  specialty: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_specialty | null;
  specialization: string | null;
  qualification: string | null;
  city: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  doctorType: DoctorType;
  doctorHospital: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors_doctorHospital[];
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctorsNextAvailability {
  __typename: "DoctorSlotAvailability";
  doctorId: string | null;
  onlineSlot: string | null;
  physicalSlot: string | null;
  referenceSlot: string | null;
}

export interface SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName {
  __typename: "SearchDoctorAndSpecialtyByNameResult";
  doctors: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null)[] | null;
  doctorsNextAvailability: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability | null)[] | null;
  specialties: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties | null)[] | null;
  possibleMatches: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches | null;
  otherDoctors: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors | null)[] | null;
  otherDoctorsNextAvailability: (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctorsNextAvailability | null)[] | null;
}

export interface SearchDoctorAndSpecialtyByName {
  SearchDoctorAndSpecialtyByName: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName | null;
}

export interface SearchDoctorAndSpecialtyByNameVariables {
  searchText: string;
  patientId?: string | null;
  geolocation?: Geolocation | null;
  pincode?: string | null;
}
