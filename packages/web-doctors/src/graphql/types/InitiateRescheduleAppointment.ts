/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RescheduleAppointmentInput, TRANSFER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: InitiateRescheduleAppointment
// ====================================================

export interface InitiateRescheduleAppointment_initiateRescheduleAppointment_rescheduleAppointment {
  __typename: "RescheduleAppointment";
  id: string;
  rescheduleStatus: TRANSFER_STATUS;
  rescheduleReason: string;
  rescheduledDateTime: any | null;
}

export interface InitiateRescheduleAppointment_initiateRescheduleAppointment {
  __typename: "RescheduleAppointmentResult";
  rescheduleAppointment: InitiateRescheduleAppointment_initiateRescheduleAppointment_rescheduleAppointment | null;
  rescheduleCount: number | null;
}

export interface InitiateRescheduleAppointment {
  initiateRescheduleAppointment: InitiateRescheduleAppointment_initiateRescheduleAppointment;
}

export interface InitiateRescheduleAppointmentVariables {
  RescheduleAppointmentInput: RescheduleAppointmentInput;
}
