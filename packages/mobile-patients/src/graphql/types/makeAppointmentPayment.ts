/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AppointmentPaymentInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: makeAppointmentPayment
// ====================================================

export interface makeAppointmentPayment_makeAppointmentPayment_appointment_appointment {
  __typename: "Appointment";
  id: string;
}

export interface makeAppointmentPayment_makeAppointmentPayment_appointment {
  __typename: "AppointmentPayment";
  id: string;
  amountPaid: number;
  paymentRefId: string | null;
  paymentDateTime: any;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  orderId: string;
  appointment: makeAppointmentPayment_makeAppointmentPayment_appointment_appointment | null;
}

export interface makeAppointmentPayment_makeAppointmentPayment {
  __typename: "AppointmentPaymentResult";
  appointment: makeAppointmentPayment_makeAppointmentPayment_appointment | null;
}

export interface makeAppointmentPayment {
  makeAppointmentPayment: makeAppointmentPayment_makeAppointmentPayment;
}

export interface makeAppointmentPaymentVariables {
  paymentInput?: AppointmentPaymentInput | null;
}
