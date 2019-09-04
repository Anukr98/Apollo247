/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { RescheduleAppointmentInput, TRANSFER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: initiateRescheduleAppointment
// ====================================================

export interface initiateRescheduleAppointment_initiateRescheduleAppointment_rescheduleAppointment {
  __typename: "RescheduleAppointment";
  id: string;
  rescheduleStatus: TRANSFER_STATUS;
  rescheduleReason: string;
  rescheduledDateTime: any | null;
}

export interface initiateRescheduleAppointment_initiateRescheduleAppointment {
  __typename: "RescheduleAppointmentResult";
  rescheduleAppointment: initiateRescheduleAppointment_initiateRescheduleAppointment_rescheduleAppointment | null;
  rescheduleCount: number | null;
}

export interface initiateRescheduleAppointment {
  initiateRescheduleAppointment: initiateRescheduleAppointment_initiateRescheduleAppointment;
}

export interface initiateRescheduleAppointmentVariables {
  RescheduleAppointmentInput: RescheduleAppointmentInput;
}
