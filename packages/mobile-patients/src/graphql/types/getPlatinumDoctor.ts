/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ZoneType, ConsultMode, PLAN, PLAN_STATUS, APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPlatinumDoctor
// ====================================================

export interface getPlatinumDoctor_getPlatinumDoctor_doctors_availabilityTitle {
  __typename: "AvailabilityTitle";
  AVAILABLE_NOW: string | null;
  CONSULT_NOW: string | null;
  DOCTOR_OF_HOUR: string | null;
}

export interface getPlatinumDoctor_getPlatinumDoctor_doctors_doctorPricing {
  __typename: "DoctorPricing";
  slashed_price: number | null;
  available_to: PLAN | null;
  status: PLAN_STATUS | null;
  mrp: number | null;
  appointment_type: APPOINTMENT_TYPE | null;
}

export interface getPlatinumDoctor_getPlatinumDoctor_doctors {
  __typename: "doctorCardDetail";
  id: string | null;
  displayName: string | null;
  doctorType: string | null;
  consultMode: ConsultMode | null;
  earliestSlotInMinutes: number | null;
  doctorfacility: string | null;
  fee: number | null;
  specialistPluralTerm: string | null;
  specialtydisplayName: string | null;
  qualification: string | null;
  experience: number | null;
  photoUrl: string | null;
  profile_deeplink: string | null;
  slot: string | null;
  thumbnailUrl: string | null;
  availabilityTitle: getPlatinumDoctor_getPlatinumDoctor_doctors_availabilityTitle | null;
  doctorPricing: (getPlatinumDoctor_getPlatinumDoctor_doctors_doctorPricing | null)[] | null;
}

export interface getPlatinumDoctor_getPlatinumDoctor {
  __typename: "PlatinumDoctorResult";
  doctors: (getPlatinumDoctor_getPlatinumDoctor_doctors | null)[] | null;
}

export interface getPlatinumDoctor {
  getPlatinumDoctor: getPlatinumDoctor_getPlatinumDoctor | null;
}

export interface getPlatinumDoctorVariables {
  specialtyId?: string | null;
  zoneType?: ZoneType | null;
  zone?: string | null;
  partnerDoctor?: boolean | null;
}
