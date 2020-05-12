/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE, STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetConsultQueue
// ====================================================

export interface GetConsultQueue_getConsultQueue_consultQueue_patient {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
}

export interface GetConsultQueue_getConsultQueue_consultQueue_appointment {
  __typename: "Appointment";
  id: string;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
  status: STATUS;
}

export interface GetConsultQueue_getConsultQueue_consultQueue {
  __typename: "ConsultQueueItem";
  id: number;
  isActive: boolean;
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
