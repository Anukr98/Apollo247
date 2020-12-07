/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_STATE } from "./globalTypes";

// ====================================================
// GraphQL query operation: checkIfReschedule
// ====================================================

export interface checkIfReschedule_checkIfReschedule {
  __typename: "CheckRescheduleResult";
  isPaid: number;
  isCancel: number;
  isFollowUp: number;
  appointmentState: APPOINTMENT_STATE;
  rescheduleCount: number;
}

export interface checkIfReschedule {
  checkIfReschedule: checkIfReschedule_checkIfReschedule;
}

export interface checkIfRescheduleVariables {
  existAppointmentId: string;
  rescheduleDate: any;
}
