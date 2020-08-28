/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BookTransferAppointmentInput, APPOINTMENT_TYPE, STATUS, APPOINTMENT_STATE } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: bookTransferAppointment
// ====================================================

export interface bookTransferAppointment_bookTransferAppointment_appointment {
  __typename: "TransferAppointmentBooking";
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: any;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string | null;
  status: STATUS;
  appointmentState: APPOINTMENT_STATE | null;
  patientName: string;
}

export interface bookTransferAppointment_bookTransferAppointment {
  __typename: "BookTransferAppointmentResult";
  appointment: bookTransferAppointment_bookTransferAppointment_appointment | null;
}

export interface bookTransferAppointment {
  bookTransferAppointment: bookTransferAppointment_bookTransferAppointment;
}

export interface bookTransferAppointmentVariables {
  BookTransferAppointmentInput: BookTransferAppointmentInput;
}
