/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AppointmentPaymentInputV2 } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: makeAppointmentPaymentV2
// ====================================================

export interface makeAppointmentPaymentV2_makeAppointmentPaymentV2_appointment {
  __typename: "AppointmentPayment";
  id: string;
}

export interface makeAppointmentPaymentV2_makeAppointmentPaymentV2 {
  __typename: "AppointmentPaymentResult";
  appointment: makeAppointmentPaymentV2_makeAppointmentPaymentV2_appointment | null;
}

export interface makeAppointmentPaymentV2 {
  makeAppointmentPaymentV2: makeAppointmentPaymentV2_makeAppointmentPaymentV2;
}

export interface makeAppointmentPaymentV2Variables {
  paymentInput?: AppointmentPaymentInputV2 | null;
}
