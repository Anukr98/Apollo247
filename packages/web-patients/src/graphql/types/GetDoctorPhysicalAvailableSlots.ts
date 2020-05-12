/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorPhysicalAvailabilityInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorPhysicalAvailableSlots
// ====================================================

export interface GetDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots {
  __typename: "PhysicalAvailabilityResult";
  availableSlots: string[] | null;
}

export interface GetDoctorPhysicalAvailableSlots {
  getDoctorPhysicalAvailableSlots: GetDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots;
}

export interface GetDoctorPhysicalAvailableSlotsVariables {
  DoctorPhysicalAvailabilityInput?: DoctorPhysicalAvailabilityInput | null;
}
