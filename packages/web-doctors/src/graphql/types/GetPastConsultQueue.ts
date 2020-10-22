/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPastConsultQueue
// ====================================================

export interface GetPastConsultQueue_getPastConsultQueue_consultQueue_patient {
  __typename: "Patient";
  firstName: string | null;
  lastName: string | null;
  uhid: string | null;
  photoUrl: string | null;
  id: string;
}

export interface GetPastConsultQueue_getPastConsultQueue_consultQueue_appointment {
  __typename: "Appointment";
  id: string;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
}

export interface GetPastConsultQueue_getPastConsultQueue_consultQueue {
  __typename: "ConsultQueueItem";
  id: number;
  isActive: boolean;
  patient: GetPastConsultQueue_getPastConsultQueue_consultQueue_patient;
  appointment: GetPastConsultQueue_getPastConsultQueue_consultQueue_appointment;
}

export interface GetPastConsultQueue_getPastConsultQueue {
  __typename: "GetConsultQueueResult";
  consultQueue: GetPastConsultQueue_getPastConsultQueue_consultQueue[];
}

export interface GetPastConsultQueue {
  getPastConsultQueue: GetPastConsultQueue_getPastConsultQueue;
}

export interface GetPastConsultQueueVariables {
  doctorId: string;
  limit?: number | null;
  offset?: number | null;
}
