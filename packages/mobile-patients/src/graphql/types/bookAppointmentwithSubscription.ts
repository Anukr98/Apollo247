/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BookAppointmentInput, CreateUserSubscriptionInput, STATUS, APPOINTMENT_TYPE, SubscriptionStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: bookAppointmentwithSubscription
// ====================================================

export interface bookAppointmentwithSubscription_bookAppointment_appointment {
  __typename: "AppointmentBookingResult";
  id: string;
  doctorId: string;
  appointmentDateTime: any;
  status: STATUS;
  appointmentType: APPOINTMENT_TYPE;
  patientId: string;
  displayId: number;
  paymentOrderId: string | null;
}

export interface bookAppointmentwithSubscription_bookAppointment {
  __typename: "BookAppointmentResult";
  appointment: bookAppointmentwithSubscription_bookAppointment_appointment | null;
}

export interface bookAppointmentwithSubscription_CreateUserSubscription_response_group_plan {
  __typename: "GroupPlanType";
  name: string;
  plan_id: string;
}

export interface bookAppointmentwithSubscription_CreateUserSubscription_response {
  __typename: "UserSubscription";
  _id: string | null;
  mobile_number: string;
  status: SubscriptionStatus;
  start_date: any;
  end_date: any;
  group_plan: bookAppointmentwithSubscription_CreateUserSubscription_response_group_plan;
}

export interface bookAppointmentwithSubscription_CreateUserSubscription {
  __typename: "MutateUserSubscriptionResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: bookAppointmentwithSubscription_CreateUserSubscription_response | null;
}

export interface bookAppointmentwithSubscription {
  bookAppointment: bookAppointmentwithSubscription_bookAppointment;
  CreateUserSubscription: bookAppointmentwithSubscription_CreateUserSubscription;
}

export interface bookAppointmentwithSubscriptionVariables {
  bookAppointment: BookAppointmentInput;
  userSubscription: CreateUserSubscriptionInput;
}
