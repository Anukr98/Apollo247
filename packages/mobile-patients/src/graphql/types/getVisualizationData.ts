/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getVisualizationData
// ====================================================

export interface getVisualizationData_getVisualizationData_response {
  __typename: "VisualizationBaseResponse";
  parameterName: string | null;
  result: string | null;
  unit: string | null;
  range: string | null;
  resultDate: string | null;
}

export interface getVisualizationData_getVisualizationData {
  __typename: "VisualizationResponse";
  errorCode: number | null;
  errorMsg: string | null;
  response: (getVisualizationData_getVisualizationData_response | null)[] | null;
}

export interface getVisualizationData {
  getVisualizationData: getVisualizationData_getVisualizationData | null;
}

export interface getVisualizationDataVariables {
  uhid: string;
  serviceName: string;
  parameterName: string;
}
