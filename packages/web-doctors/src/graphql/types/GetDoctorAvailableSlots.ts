/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DoctorAvailabilityInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorAvailableSlots
// ====================================================

export interface GetDoctorAvailableSlots_getDoctorAvailableSlots {
  __typename: "AvailabilityResult";
  availableSlots: string[] | null;
}

export interface GetDoctorAvailableSlots {
  getDoctorAvailableSlots: GetDoctorAvailableSlots_getDoctorAvailableSlots;
}

export interface GetDoctorAvailableSlotsVariables {
  DoctorAvailabilityInput?: DoctorAvailabilityInput | null;
}
