/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UnitTypes } from "./globalTypes";

// ====================================================
// GraphQL query operation: getProHealthHospitalByCityId
// ====================================================

export interface getProHealthHospitalByCityId_getProHealthHospitalByCityId_hospitals {
  __typename: "ProhealthHospital";
  unitName: string;
  unitType: UnitTypes;
  unitLocationId: number;
  id: string;
}

export interface getProHealthHospitalByCityId_getProHealthHospitalByCityId {
  __typename: "ProhealthHospitalDetails";
  hospitals: (getProHealthHospitalByCityId_getProHealthHospitalByCityId_hospitals | null)[] | null;
}

export interface getProHealthHospitalByCityId {
  getProHealthHospitalByCityId: getProHealthHospitalByCityId_getProHealthHospitalByCityId | null;
}

export interface getProHealthHospitalByCityIdVariables {
  cityId: string;
}
