/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorPhysicalAvailabilityInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getDoctorPhysicalAvailableSlots
// ====================================================

export interface getDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots {
  __typename: "PhysicalAvailabilityResult";
  availableSlots: string[] | null;
}

export interface getDoctorPhysicalAvailableSlots {
  getDoctorPhysicalAvailableSlots: getDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots;
}

export interface getDoctorPhysicalAvailableSlotsVariables {
  DoctorPhysicalAvailabilityInput: DoctorPhysicalAvailabilityInput;
}
