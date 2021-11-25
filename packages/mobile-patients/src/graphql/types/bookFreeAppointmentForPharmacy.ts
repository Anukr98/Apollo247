/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SubscriptionDetailsInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: bookFreeAppointmentForPharmacy
// ====================================================

export interface bookFreeAppointmentForPharmacy_bookFreeAppointmentForPharmacy {
  __typename: "BookFreeAppointmentForPharmacyResult";
  appointmentDateTime: any;
  appointmentId: string;
  displayId: string;
  doctorName: string;
  doctorId: string | null;
  isError: boolean;
  error: string | null;
}

export interface bookFreeAppointmentForPharmacy {
  bookFreeAppointmentForPharmacy: bookFreeAppointmentForPharmacy_bookFreeAppointmentForPharmacy;
}

export interface bookFreeAppointmentForPharmacyVariables {
  patientId: string;
  subscriptionDetailsInput?: SubscriptionDetailsInput | null;
}
