/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorAvailabilityInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorAvailableSlots
// ====================================================

export interface getDoctorAvailableSlots_getDoctorAvailableSlots_slotCounts {
  __typename: "slotCountsWithDate";
  date: any | null;
  slotCount: number;
}

export interface getDoctorAvailableSlots_getDoctorAvailableSlots {
  __typename: "AvailabilityResult";
  availableSlots: string[] | null;
  slotCounts: (getDoctorAvailableSlots_getDoctorAvailableSlots_slotCounts | null)[] | null;
}

export interface getDoctorAvailableSlots {
  getDoctorAvailableSlots: getDoctorAvailableSlots_getDoctorAvailableSlots;
}

export interface getDoctorAvailableSlotsVariables {
  DoctorAvailabilityInput: DoctorAvailabilityInput;
}
