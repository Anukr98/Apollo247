/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorAvailabilityInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorAvailableSlots
// ====================================================

export interface getDoctorAvailableSlots_getDoctorAvailableSlots {
  __typename: "AvailabilityResult";
  availableSlots: string[] | null;
}

export interface getDoctorAvailableSlots {
  getDoctorAvailableSlots: getDoctorAvailableSlots_getDoctorAvailableSlots;
}

export interface getDoctorAvailableSlotsVariables {
  DoctorAvailabilityInput: DoctorAvailabilityInput;
}
