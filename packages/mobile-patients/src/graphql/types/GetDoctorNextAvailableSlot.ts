/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DoctorNextAvailableSlotInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorNextAvailableSlot
// ====================================================

export interface GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots {
  __typename: "SlotAvailability";
  availableSlot: string;
  doctorId: string;
  physicalAvailableSlot: string;
}

export interface GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot {
  __typename: "SlotAvailabilityResult";
  doctorAvailalbeSlots: (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[] | null;
}

export interface GetDoctorNextAvailableSlot {
  getDoctorNextAvailableSlot: GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot;
}

export interface GetDoctorNextAvailableSlotVariables {
  DoctorNextAvailableSlotInput: DoctorNextAvailableSlotInput;
}
