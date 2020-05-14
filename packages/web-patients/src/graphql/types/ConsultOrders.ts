/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: ConsultOrders
// ====================================================

export interface ConsultOrders_consultOrders_appointments_appointmentPayments {
  __typename: "ApptPayment";
  amountPaid: number | null;
  bankTxnId: string | null;
  id: string | null;
  paymentRefId: string | null;
  paymentStatus: string | null;
  paymentType: string | null;
  responseMessage: string | null;
}

export interface ConsultOrders_consultOrders_appointments_doctor {
  __typename: "DoctorResponse";
  name: string | null;
}

export interface ConsultOrders_consultOrders_appointments {
  __typename: "ApptResponse";
  displayId: number | null;
  id: string | null;
  appointmentDateTime: any | null;
  actualAmount: number | null;
  discountedAmount: number | null;
  appointmentType: string | null;
  appointmentPayments: (ConsultOrders_consultOrders_appointments_appointmentPayments | null)[] | null;
  status: STATUS | null;
  doctorId: string | null;
  doctor: ConsultOrders_consultOrders_appointments_doctor | null;
}

export interface ConsultOrders_consultOrders {
  __typename: "AppointmentsResult";
  appointments: (ConsultOrders_consultOrders_appointments | null)[] | null;
}

export interface ConsultOrders {
  consultOrders: ConsultOrders_consultOrders | null;
}

export interface ConsultOrdersVariables {
  patientId?: string | null;
}
