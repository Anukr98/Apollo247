/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ConsultMode } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPlatinumDoctor
// ====================================================

export interface getPlatinumDoctor_getPlatinumDoctor_doctors {
  __typename: "doctorCardDetail";
  id: string | null;
  displayName: string | null;
  doctorType: string | null;
  consultMode: ConsultMode | null;
  earliestSlotInMinutes: number | null;
  doctorfacility: string | null;
  fee: number | null;
  specialistSingularTerm: string | null;
  specialistPluralTerm: string | null;
  specialtydisplayName: string | null;
  qualification: string | null;
  experience: number | null;
  photoUrl: string | null;
  slot: string | null;
  thumbnailUrl: string | null;
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
}
