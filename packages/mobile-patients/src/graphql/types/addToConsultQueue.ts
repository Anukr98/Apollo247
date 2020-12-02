/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: addToConsultQueue
// ====================================================

export interface addToConsultQueue_addToConsultQueue_juniorDoctorsList {
  __typename: "JuniorDoctorsList";
  juniorDoctorId: string;
  doctorName: string;
}

export interface addToConsultQueue_addToConsultQueue {
  __typename: "AddToConsultQueueResult";
  id: number;
  doctorId: string;
  totalJuniorDoctorsOnline: number;
  juniorDoctorsList: (addToConsultQueue_addToConsultQueue_juniorDoctorsList | null)[];
  totalJuniorDoctors: number;
  isJdAllowed: boolean | null;
  isJdAssigned: boolean | null;
}

export interface addToConsultQueue {
  addToConsultQueue: addToConsultQueue_addToConsultQueue;
}

export interface addToConsultQueueVariables {
  appointmentId: string;
}
