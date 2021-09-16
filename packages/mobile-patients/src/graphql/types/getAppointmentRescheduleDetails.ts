/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TRANSFER_INITIATED_TYPE, TRANSFER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getAppointmentRescheduleDetails
// ====================================================

export interface getAppointmentRescheduleDetails_getAppointmentRescheduleDetails {
  __typename: "RescheduleAppointmentDetails";
  id: string;
  rescheduledDateTime: any;
  rescheduleReason: string;
  rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE | null;
  rescheduleInitiatedId: string;
  rescheduleStatus: TRANSFER_STATUS;
}

export interface getAppointmentRescheduleDetails {
  getAppointmentRescheduleDetails: getAppointmentRescheduleDetails_getAppointmentRescheduleDetails;
}

export interface getAppointmentRescheduleDetailsVariables {
  appointmentId: string;
}
