/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getAreas
// ====================================================

export interface getAreas_getAreas_areas {
  __typename: "AreasResponse";
  id: number | null;
  area: string | null;
}

export interface getAreas_getAreas {
  __typename: "GetAreasResponse";
  status: boolean | null;
  areas: (getAreas_getAreas_areas | null)[] | null;
}

export interface getAreas {
  getAreas: getAreas_getAreas;
}

export interface getAreasVariables {
  pincode: number;
  itemIDs: (number | null)[];
}
