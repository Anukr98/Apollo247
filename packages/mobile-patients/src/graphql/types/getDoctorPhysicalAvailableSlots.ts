/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorPhysicalAvailabilityInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorPhysicalAvailableSlots
// ====================================================

export interface getDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots_slotCounts {
  __typename: "slotCountsWithDate";
  date: any | null;
  slotCount: number;
}

export interface getDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots {
  __typename: "PhysicalAvailabilityResult";
  availableSlots: string[] | null;
  slotCounts: (getDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots_slotCounts | null)[] | null;
}

export interface getDoctorPhysicalAvailableSlots {
  getDoctorPhysicalAvailableSlots: getDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots;
}

export interface getDoctorPhysicalAvailableSlotsVariables {
  DoctorPhysicalAvailabilityInput: DoctorPhysicalAvailabilityInput;
}
