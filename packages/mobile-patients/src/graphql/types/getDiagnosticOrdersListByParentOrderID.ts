/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticOrdersListByParentOrderID
// ====================================================

export interface getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList_patientObj {
  __typename: "PatientObj";
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export interface getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList_diagnosticOrderLineItems_pricingObj {
  __typename: "PricingObj";
  mrp: number | null;
  price: number | null;
  groupPlan: string | null;
}

export interface getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList_diagnosticOrderLineItems_itemObj {
  __typename: "ItemObj";
  preTestingRequirement: string | null;
  reportGenerationTime: string | null;
}

export interface getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList_diagnosticOrderLineItems {
  __typename: "DiagnosticOrderLineItems";
  id: string;
  itemId: number | null;
  itemName: string | null;
  quantity: number | null;
  price: number | null;
  editOrderID: string | null;
  isRemoved: boolean | null;
  groupPlan: string | null;
  pricingObj: (getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList_diagnosticOrderLineItems_pricingObj | null)[] | null;
  itemObj: getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList_diagnosticOrderLineItems_itemObj | null;
}

export interface getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList {
  __typename: "DiagnosticOrders";
  displayId: number;
  slotDateTimeInUTC: any | null;
  diagnosticDate: any;
  patientObj: getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList_patientObj | null;
  diagnosticOrderLineItems: (getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList_diagnosticOrderLineItems | null)[] | null;
}

export interface getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID {
  __typename: "DiagnosticOrdersResult";
  ordersCount: number | null;
  ordersList: (getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList | null)[] | null;
}

export interface getDiagnosticOrdersListByParentOrderID {
  getDiagnosticOrdersListByParentOrderID: getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID;
}

export interface getDiagnosticOrdersListByParentOrderIDVariables {
  parentOrderID: string;
}
