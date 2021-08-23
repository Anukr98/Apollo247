/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorType, Gender, ConsultMode, PLAN, PLAN_STATUS, APPOINTMENT_TYPE, WeekDay } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorDetailsById
// ====================================================

export interface getDoctorDetailsById_getDoctorDetailsById_doctorPricing {
  __typename: "DoctorPricing";
  slashed_price: number | null;
  available_to: PLAN | null;
  status: PLAN_STATUS | null;
  mrp: number | null;
  appointment_type: APPOINTMENT_TYPE | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById_availabilityTitle {
  __typename: "AvailabilityTitle";
  AVAILABLE_NOW: string | null;
  CONSULT_NOW: string | null;
  DOCTOR_OF_HOUR: string | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById_specialty {
  __typename: "DoctorSpecialties";
  id: string;
  name: string;
  userFriendlyNomenclature: string | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById_doctorSecretary_secretary {
  __typename: "Secretary";
  id: string;
  name: string;
  mobileNumber: string;
  isActive: boolean;
}

export interface getDoctorDetailsById_getDoctorDetailsById_doctorSecretary {
  __typename: "DoctorSecretaryDetails";
  secretary: getDoctorDetailsById_getDoctorDetailsById_doctorSecretary_secretary | null;
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
  id: string;
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
  salutation: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  displayName: string | null;
  experience: string | null;
  city: string | null;
  photoUrl: string | null;
  qualification: string | null;
  thumbnailUrl: string | null;
  physicalConsultationFees: string;
  onlineConsultationFees: string;
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

export interface getDoctorDetailsById_getDoctorDetailsById_doctorNextAvailSlots {
  __typename: "DoctorNextAvailSlots";
  onlineSlot: string | null;
  physicalSlot: string | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById_doctorCardActiveCTA {
  __typename: "DoctorCardActiveCTA";
  ONLINE: string | null;
  PHYSICAL: string | null;
  DEFAULT: string | null;
}

export interface getDoctorDetailsById_getDoctorDetailsById {
  __typename: "DoctorDetails";
  id: string;
  skipAutoQuestions: boolean | null;
  isJdAllowed: boolean | null;
  salutation: string | null;
  firstName: string;
  lastName: string;
  fullName: string | null;
  displayName: string | null;
  doctorType: DoctorType;
  chatDays: number | null;
  doctorsOfTheHourStatus: boolean | null;
  qualification: string | null;
  mobileNumber: string;
  experience: string | null;
  specialization: string | null;
  languages: string | null;
  city: string | null;
  awards: string | null;
  gender: Gender | null;
  profile_deeplink: string | null;
  photoUrl: string | null;
  availableModes: (ConsultMode | null)[] | null;
  bookingFee: number | null;
  isBookingFeeExempted: boolean | null;
  doctorPricing: (getDoctorDetailsById_getDoctorDetailsById_doctorPricing | null)[] | null;
  availabilityTitle: getDoctorDetailsById_getDoctorDetailsById_availabilityTitle | null;
  specialty: getDoctorDetailsById_getDoctorDetailsById_specialty | null;
  registrationNumber: string;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  doctorSecretary: getDoctorDetailsById_getDoctorDetailsById_doctorSecretary | null;
  doctorHospital: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  starTeam: (getDoctorDetailsById_getDoctorDetailsById_starTeam | null)[] | null;
  consultHours: (getDoctorDetailsById_getDoctorDetailsById_consultHours | null)[] | null;
  doctorNextAvailSlots: getDoctorDetailsById_getDoctorDetailsById_doctorNextAvailSlots | null;
  doctorCardActiveCTA: getDoctorDetailsById_getDoctorDetailsById_doctorCardActiveCTA | null;
}

export interface getDoctorDetailsById {
  getDoctorDetailsById: getDoctorDetailsById_getDoctorDetailsById | null;
}

export interface getDoctorDetailsByIdVariables {
  id: string;
}
