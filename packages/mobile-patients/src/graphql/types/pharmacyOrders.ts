/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { REFUND_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: pharmacyOrders
// ====================================================

export interface pharmacyOrders_pharmacyOrders_meta {
  __typename: "PaginateMetaDataPharmacyOrders";
  pageNo: number | null;
  pageSize: number | null;
  total: number | null;
}

export interface pharmacyOrders_pharmacyOrders_pharmaOrders_medicineOrderPayments_medicineOrderRefunds {
  __typename: "MedicineOrderRefunds";
  refundAmount: number | null;
  createdDate: any | null;
  refundStatus: REFUND_STATUS | null;
  refundId: string | null;
  txnId: string | null;
}

export interface pharmacyOrders_pharmacyOrders_pharmaOrders_medicineOrderPayments {
  __typename: "PharmacyPayment";
  paymentType: string | null;
  paymentRefId: string | null;
  paymentStatus: string | null;
  paymentDateTime: any | null;
  paymentMode: string | null;
  amountPaid: number | null;
  healthCreditsRedeemed: number | null;
  refundAmount: number | null;
  medicineOrderRefunds: (pharmacyOrders_pharmacyOrders_pharmaOrders_medicineOrderPayments_medicineOrderRefunds | null)[] | null;
}

export interface pharmacyOrders_pharmacyOrders_pharmaOrders_PaymentOrdersPharma_refund {
  __typename: "Refunds";
  refundId: string | null;
  refundAmount: number | null;
  refundStatus: REFUND_STATUS | null;
  txnTimestamp: any | null;
}

export interface pharmacyOrders_pharmacyOrders_pharmaOrders_PaymentOrdersPharma {
  __typename: "PaymentOrdersResponse";
  paymentRefId: string | null;
  paymentStatus: string | null;
  paymentDateTime: any | null;
  amountPaid: number | null;
  paymentMode: string | null;
  refund: (pharmacyOrders_pharmacyOrders_pharmaOrders_PaymentOrdersPharma_refund | null)[] | null;
}

export interface pharmacyOrders_pharmacyOrders_pharmaOrders {
  __typename: "PharmaResponse";
  id: string | null;
  estimatedAmount: number | null;
  devliveryCharges: number | null;
  bookingSource: string | null;
  orderAutoId: number | null;
  appointmentId: string | null;
  currentStatus: string | null;
  orderType: string | null;
  orderDateTime: any | null;
  quoteDateTime: any | null;
  medicineOrderPayments: (pharmacyOrders_pharmacyOrders_pharmaOrders_medicineOrderPayments | null)[] | null;
  PaymentOrdersPharma: pharmacyOrders_pharmacyOrders_pharmaOrders_PaymentOrdersPharma | null;
}

export interface pharmacyOrders_pharmacyOrders {
  __typename: "PharmacyOrderResult";
  meta: pharmacyOrders_pharmacyOrders_meta | null;
  pharmaOrders: (pharmacyOrders_pharmacyOrders_pharmaOrders | null)[] | null;
}

export interface pharmacyOrders {
  pharmacyOrders: pharmacyOrders_pharmacyOrders | null;
}

export interface pharmacyOrdersVariables {
  patientId: string;
  pageNo: number;
  pageSize: number;
}
