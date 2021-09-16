/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { STATUS, REFUND_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: consultOrders
// ====================================================

export interface consultOrders_consultOrders_meta {
  __typename: "PaginateMetaDataConsultOrders";
  pageNo: number | null;
  pageSize: number | null;
  total: number | null;
}

export interface consultOrders_consultOrders_appointments_appointmentRefunds {
  __typename: "ApptRefunds";
  refundAmount: number | null;
  txnTimestamp: any | null;
  refundStatus: REFUND_STATUS | null;
}

export interface consultOrders_consultOrders_appointments_appointmentPayments {
  __typename: "ApptPayment";
  paymentRefId: string | null;
  paymentStatus: string | null;
  amountPaid: number | null;
}

export interface consultOrders_consultOrders_appointments_PaymentOrders_refund {
  __typename: "Refunds";
  refundAmount: number | null;
  refundStatus: REFUND_STATUS | null;
  refundId: string | null;
}

export interface consultOrders_consultOrders_appointments_PaymentOrders {
  __typename: "PaymentOrdersResponse";
  paymentRefId: string | null;
  paymentStatus: string | null;
  amountPaid: number | null;
  refund: (consultOrders_consultOrders_appointments_PaymentOrders_refund | null)[] | null;
}

export interface consultOrders_consultOrders_appointments_doctor {
  __typename: "DoctorResponse";
  name: string | null;
}

export interface consultOrders_consultOrders_appointments {
  __typename: "ApptResponse";
  id: string | null;
  doctorId: string | null;
  displayId: number | null;
  appointmentDateTime: any | null;
  actualAmount: number | null;
  status: STATUS | null;
  appointmentType: string | null;
  discountedAmount: number | null;
  appointmentRefunds: (consultOrders_consultOrders_appointments_appointmentRefunds | null)[] | null;
  appointmentPayments: (consultOrders_consultOrders_appointments_appointmentPayments | null)[] | null;
  PaymentOrders: consultOrders_consultOrders_appointments_PaymentOrders | null;
  doctor: consultOrders_consultOrders_appointments_doctor | null;
}

export interface consultOrders_consultOrders {
  __typename: "AppointmentsResult";
  meta: consultOrders_consultOrders_meta | null;
  appointments: (consultOrders_consultOrders_appointments | null)[] | null;
}

export interface consultOrders {
  consultOrders: consultOrders_consultOrders | null;
}

export interface consultOrdersVariables {
  patientId: string;
  pageNo: number;
  pageSize: number;
}
