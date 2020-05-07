/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Salutation, DoctorType, ConsultMode, ConsultType, WeekDay } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorDetailsById
// ====================================================

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  image: string | null;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital_facility {
  __typename: "Facility";
  name: string;
  facilityType: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  id: string;
  imageUrl: string | null;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital_facility;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor {
  __typename: "Profile";
  firstName: string | null;
  lastName: string | null;
  experience: string | null;
  qualification: string | null;
  id: string;
  photoUrl: string | null;
  specialty: GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_specialty;
  doctorHospital: GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital[];
}

export interface GetDoctorDetailsById_getDoctorDetailsById_starTeam {
  __typename: "StarTeam";
  associatedDoctor: GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor | null;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  image: string | null;
  name: string;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_doctorHospital_facility {
  __typename: "Facility";
  city: string | null;
  country: string | null;
  facilityType: string;
  latitude: string | null;
  longitude: string | null;
  name: string;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  id: string;
  imageUrl: string | null;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_doctorHospital {
  __typename: "DoctorHospital";
  facility: GetDoctorDetailsById_getDoctorDetailsById_doctorHospital_facility;
}

export interface GetDoctorDetailsById_getDoctorDetailsById_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  consultType: ConsultType;
  endTime: string;
  id: string;
  startTime: string;
  weekDay: WeekDay;
  isActive: boolean;
}

export interface GetDoctorDetailsById_getDoctorDetailsById {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  fullName: string | null;
  mobileNumber: string;
  experience: string | null;
  specialization: string | null;
  languages: string | null;
  city: string | null;
  awards: string | null;
  displayName: string | null;
  photoUrl: string | null;
  registrationNumber: string;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  qualification: string | null;
  doctorType: DoctorType;
  starTeam: (GetDoctorDetailsById_getDoctorDetailsById_starTeam | null)[] | null;
  specialty: GetDoctorDetailsById_getDoctorDetailsById_specialty | null;
  zip: string | null;
  doctorHospital: GetDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  consultHours: (GetDoctorDetailsById_getDoctorDetailsById_consultHours | null)[] | null;
}

export interface GetDoctorDetailsById {
  getDoctorDetailsById: GetDoctorDetailsById_getDoctorDetailsById | null;
}

export interface GetDoctorDetailsByIdVariables {
  id: string;
}
