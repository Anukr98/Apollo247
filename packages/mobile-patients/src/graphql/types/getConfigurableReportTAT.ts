/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getConfigurableReportTAT
// ====================================================

export interface getConfigurableReportTAT_getConfigurableReportTAT {
  __typename: "getConfigurableReportTATResult";
  maxReportTAT: any;
  reportTATMessage: string | null;
}

export interface getConfigurableReportTAT {
  getConfigurableReportTAT: getConfigurableReportTAT_getConfigurableReportTAT;
}

export interface getConfigurableReportTATVariables {
  cityId: number;
  pincode: number;
  itemIds: (number | null)[];
}
