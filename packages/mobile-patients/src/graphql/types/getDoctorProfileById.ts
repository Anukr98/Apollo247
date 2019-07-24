/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDoctorProfileById
// ====================================================

export interface getDoctorProfileById_getDoctorProfileById_profile {
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
  awards: string | null;
  photoUrl: string | null;
  registrationNumber: string;
  isProfileComplete: string;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
}

export interface getDoctorProfileById_getDoctorProfileById_paymentDetails {
  __typename: "PaymentDetails";
  accountNumber: string;
  address: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById_clinics {
  __typename: "Clinics";
  id: string;
  name: string;
  image: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  city: string | null;
  isClinic: boolean | null;
}

export interface getDoctorProfileById_getDoctorProfileById_starDoctorTeam {
  __typename: "Doctor";
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  experience: string | null;
  speciality: string;
  specialization: string | null;
  education: string;
  city: string | null;
  address: string | null;
  photoUrl: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById_consultationHours {
  __typename: "Consultations";
  days: string;
  startTime: any;
  endTime: any;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  type: string | null;
}

export interface getDoctorProfileById_getDoctorProfileById {
  __typename: "DoctorProfile";
  profile: getDoctorProfileById_getDoctorProfileById_profile;
  paymentDetails: getDoctorProfileById_getDoctorProfileById_paymentDetails[] | null;
  clinics: getDoctorProfileById_getDoctorProfileById_clinics[] | null;
  starDoctorTeam: getDoctorProfileById_getDoctorProfileById_starDoctorTeam[] | null;
  consultationHours: getDoctorProfileById_getDoctorProfileById_consultationHours[] | null;
}

export interface getDoctorProfileById {
  getDoctorProfileById: getDoctorProfileById_getDoctorProfileById | null;
}

export interface getDoctorProfileByIdVariables {
  id: string;
}
