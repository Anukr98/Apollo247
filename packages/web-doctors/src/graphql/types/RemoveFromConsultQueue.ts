/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { APPOINTMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RemoveFromConsultQueue
// ====================================================

export interface RemoveFromConsultQueue_removeFromConsultQueue_consultQueue_patient {
  __typename: "Patient";
  id: string;
  uhid: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
}

export interface RemoveFromConsultQueue_removeFromConsultQueue_consultQueue_appointment {
  __typename: "Appointment";
  id: string;
  appointmentType: APPOINTMENT_TYPE;
  appointmentDateTime: any;
}

export interface RemoveFromConsultQueue_removeFromConsultQueue_consultQueue {
  __typename: "ConsultQueueItem";
  id: number;
  isActive: boolean;
  patient: RemoveFromConsultQueue_removeFromConsultQueue_consultQueue_patient;
  appointment: RemoveFromConsultQueue_removeFromConsultQueue_consultQueue_appointment;
}

export interface RemoveFromConsultQueue_removeFromConsultQueue {
  __typename: "RemoveFromConsultQueueResult";
  consultQueue: RemoveFromConsultQueue_removeFromConsultQueue_consultQueue[];
}

export interface RemoveFromConsultQueue {
  removeFromConsultQueue: RemoveFromConsultQueue_removeFromConsultQueue;
}

export interface RemoveFromConsultQueueVariables {
  id: number;
}
