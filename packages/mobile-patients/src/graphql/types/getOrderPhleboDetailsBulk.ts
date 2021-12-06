/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getOrderPhleboDetailsBulk
// ====================================================

export interface getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk_orderPhleboDetailsBulk_orderPhleboDetails_diagnosticPhlebotomists {
  __typename: "DiagnosticPhlebotomists";
  name: string;
  mobile: string | null;
  vaccinationStatus: string | null;
}

export interface getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk_orderPhleboDetailsBulk_orderPhleboDetails {
  __typename: "DiagnosticOrderPhlebotomists";
  diagnosticOrdersId: string;
  isPhleboChanged: boolean | null;
  diagnosticPhlebotomists: getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk_orderPhleboDetailsBulk_orderPhleboDetails_diagnosticPhlebotomists;
  phleboOTP: string | null;
  phleboTrackLink: string | null;
  phleboRating: number | null;
}

export interface getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk_orderPhleboDetailsBulk_phleboEta {
  __typename: "EtaDetails";
  distanceInMetres: number | null;
  estimatedArrivalTime: any | null;
}

export interface getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk_orderPhleboDetailsBulk {
  __typename: "DiagnosticOrderPhleboResult";
  allowCalling: boolean | null;
  showPhleboDetails: boolean | null;
  phleboDetailsETAText: string | null;
  allowCallingETAText: string | null;
  orderPhleboDetails: getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk_orderPhleboDetailsBulk_orderPhleboDetails | null;
  phleboEta: getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk_orderPhleboDetailsBulk_phleboEta | null;
}

export interface getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk {
  __typename: "DiagnosticOrderPhleboResultBulk";
  orderPhleboDetailsBulk: (getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk_orderPhleboDetailsBulk | null)[] | null;
}

export interface getOrderPhleboDetailsBulk {
  getOrderPhleboDetailsBulk: getOrderPhleboDetailsBulk_getOrderPhleboDetailsBulk | null;
}

export interface getOrderPhleboDetailsBulkVariables {
  diagnosticOrdersIds: (string | null)[];
}
