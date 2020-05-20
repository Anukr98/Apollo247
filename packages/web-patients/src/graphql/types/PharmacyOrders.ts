/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PharmacyOrders
// ====================================================

export interface PharmacyOrders_pharmacyOrders_pharmaOrders_medicineOrderPayments {
  __typename: "PharmacyPayment";
  paymentStatus: string | null;
  paymentRefId: string | null;
  paymentType: string | null;
  amountPaid: number | null;
  paymentDateTime: any | null;
  paymentMode: string | null;
}

export interface PharmacyOrders_pharmacyOrders_pharmaOrders {
  __typename: "PharmaResponse";
  id: string | null;
  bookingSource: string | null;
  devliveryCharges: number | null;
  estimatedAmount: number | null;
  orderAutoId: number | null;
  appointmentId: string | null;
  currentStatus: string | null;
  orderType: string | null;
  quoteDateTime: any | null;
  orderDateTime: any | null;
  medicineOrderPayments: (PharmacyOrders_pharmacyOrders_pharmaOrders_medicineOrderPayments | null)[] | null;
}

export interface PharmacyOrders_pharmacyOrders {
  __typename: "PharmacyOrderResult";
  pharmaOrders: (PharmacyOrders_pharmacyOrders_pharmaOrders | null)[] | null;
}

export interface PharmacyOrders {
  pharmacyOrders: PharmacyOrders_pharmacyOrders | null;
}

export interface PharmacyOrdersVariables {
  patientId?: string | null;
}
