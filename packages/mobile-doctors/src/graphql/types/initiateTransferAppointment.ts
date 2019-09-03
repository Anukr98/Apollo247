/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { TransferAppointmentInput, TRANSFER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: initiateTransferAppointment
// ====================================================

export interface initiateTransferAppointment_initiateTransferAppointment_transferAppointment {
  __typename: "TransferAppointment";
  id: string;
  transferStatus: TRANSFER_STATUS;
  transferReason: string;
  transferredDoctorId: string | null;
  transferredSpecialtyId: string | null;
}

export interface initiateTransferAppointment_initiateTransferAppointment {
  __typename: "TransferAppointmentResult";
  transferAppointment: initiateTransferAppointment_initiateTransferAppointment_transferAppointment | null;
  doctorNextSlot: string | null;
}

export interface initiateTransferAppointment {
  initiateTransferAppointment: initiateTransferAppointment_initiateTransferAppointment;
}

export interface initiateTransferAppointmentVariables {
  TransferAppointmentInput: TransferAppointmentInput;
}
