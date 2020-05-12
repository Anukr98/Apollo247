/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TransferAppointmentInput, TRANSFER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: InitiateTransferAppointment
// ====================================================

export interface InitiateTransferAppointment_initiateTransferAppointment_transferAppointment {
  __typename: "TransferAppointment";
  id: string;
  transferStatus: TRANSFER_STATUS;
  transferReason: string;
  transferredDoctorId: string | null;
  transferredSpecialtyId: string | null;
}

export interface InitiateTransferAppointment_initiateTransferAppointment {
  __typename: "TransferAppointmentResult";
  transferAppointment: InitiateTransferAppointment_initiateTransferAppointment_transferAppointment | null;
  doctorNextSlot: string | null;
}

export interface InitiateTransferAppointment {
  initiateTransferAppointment: InitiateTransferAppointment_initiateTransferAppointment;
}

export interface InitiateTransferAppointmentVariables {
  TransferAppointmentInput: TransferAppointmentInput;
}
