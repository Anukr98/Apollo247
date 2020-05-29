/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddToConsultQueue
// ====================================================

export interface AddToConsultQueue_addToConsultQueue {
  __typename: "AddToConsultQueueResult";
  id: number;
  doctorId: string;
}

export interface AddToConsultQueue {
  addToConsultQueue: AddToConsultQueue_addToConsultQueue;
}

export interface AddToConsultQueueVariables {
  appointmentId: string;
}
