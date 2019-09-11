/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetConsultQueue
// ====================================================

export interface GetConsultQueue_getConsultQueue_consultQueue_patient {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
}

export interface GetConsultQueue_getConsultQueue_consultQueue_appointment {
  __typename: "Appointment";
  id: string;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
}

export interface GetConsultQueue_getConsultQueue_consultQueue {
  __typename: "ConsultQueueItem";
  order: number;
  patient: GetConsultQueue_getConsultQueue_consultQueue_patient;
  appointment: GetConsultQueue_getConsultQueue_consultQueue_appointment;
}

export interface GetConsultQueue_getConsultQueue {
  __typename: "GetConsultQueueResult";
  consultQueue: GetConsultQueue_getConsultQueue_consultQueue[];
}

export interface GetConsultQueue {
  getConsultQueue: GetConsultQueue_getConsultQueue;
}

export interface GetConsultQueueVariables {
  doctorId: string;
}
