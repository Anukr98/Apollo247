/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getConfigurableReportTAT
// ====================================================

export interface getConfigurableReportTAT_getConfigurableReportTAT_itemLevelReportTATs {
  __typename: "ItemLevelReportTAT";
  itemId: number | null;
  reportTATMessage: string | null;
  reportTATInUTC: any | null;
}

export interface getConfigurableReportTAT_getConfigurableReportTAT {
  __typename: "getConfigurableReportTATResult";
  maxReportTAT: any;
  reportTATMessage: string | null;
  itemLevelReportTATs: (getConfigurableReportTAT_getConfigurableReportTAT_itemLevelReportTATs | null)[] | null;
}

export interface getConfigurableReportTAT {
  getConfigurableReportTAT: getConfigurableReportTAT_getConfigurableReportTAT;
}

export interface getConfigurableReportTATVariables {
  slotDateTimeInUTC?: any | null;
  cityId: number;
  pincode: number;
  itemIds: (number | null)[];
}
