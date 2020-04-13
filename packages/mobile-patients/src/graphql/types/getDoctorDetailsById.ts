/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Salutation, DoctorType, ConsultMode, WeekDay } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorDetailsById
// ====================================================

export interface getDoctorDetailsById_getDoctorDetailsById_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  facilityType: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  imageUrl: string | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById_doctorHospital {
  __typename: "DoctorHospital";
  facility: getDoctorDetailsById_getDoctorDetailsById_doctorHospital_facility;
}

export interface getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_specialty {
  __typename: "DoctorSpecialties";
  name: string;
  image: string | null;
  userFriendlyNomenclature: string | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital_facility {
  __typename: "Facility";
  id: string;
  name: string;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  city: string | null;
  facilityType: string;
}

export interface getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital {
  __typename: "DoctorHospital";
  facility: getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital_facility;
}

export interface getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor {
  __typename: "Profile";
  id: string;
  salutation: Salutation | null;
  firstName: string | null;
  lastName: string | null;
  experience: string | null;
  city: string | null;
  photoUrl: string | null;
  qualification: string | null;
  specialty: getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_specialty;
  doctorType: DoctorType;
  doctorHospital: getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor_doctorHospital[];
}

export interface getDoctorDetailsById_getDoctorDetailsById_starTeam {
  __typename: "StarTeam";
  associatedDoctor: getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor | null;
  isActive: boolean | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById_consultHours_facility {
  __typename: "Facility";
  id: string;
}

export interface getDoctorDetailsById_getDoctorDetailsById_consultHours {
  __typename: "ConsultHours";
  consultMode: ConsultMode;
  endTime: string;
  startTime: string;
  weekDay: WeekDay;
  isActive: boolean;
  id: string;
  facility: getDoctorDetailsById_getDoctorDetailsById_consultHours_facility | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById {
  __typename: "DoctorDetails";
  id: string;
  salutation: Salutation | null;
  firstName: string;
  lastName: string;
  fullName: string | null;
  displayName: string | null;
  doctorType: DoctorType;
  qualification: string | null;
  mobileNumber: string;
  experience: string | null;
  specialization: string | null;
  languages: string | null;
  city: string | null;
  awards: string | null;
  photoUrl: string | null;
  specialty: getDoctorDetailsById_getDoctorDetailsById_specialty | null;
  registrationNumber: string;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  doctorHospital: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  starTeam: (getDoctorDetailsById_getDoctorDetailsById_starTeam | null)[] | null;
  consultHours: (getDoctorDetailsById_getDoctorDetailsById_consultHours | null)[] | null;
}

export interface getDoctorDetailsById {
  getDoctorDetailsById: getDoctorDetailsById_getDoctorDetailsById | null;
}

export interface getDoctorDetailsByIdVariables {
  id: string;
}
