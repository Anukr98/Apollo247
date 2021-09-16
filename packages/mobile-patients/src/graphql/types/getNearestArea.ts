/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getNearestArea
// ====================================================

export interface getNearestArea_getNearestArea_area {
  __typename: "areaResponse";
  id: number | null;
  area: string | null;
}

export interface getNearestArea_getNearestArea {
  __typename: "getNearestAreaResponse";
  area: getNearestArea_getNearestArea_area | null;
}

export interface getNearestArea {
  getNearestArea: getNearestArea_getNearestArea;
}

export interface getNearestAreaVariables {
  patientAddressId: string;
}
