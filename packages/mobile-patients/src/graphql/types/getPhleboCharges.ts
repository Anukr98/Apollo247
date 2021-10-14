/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChargeDetailsInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPhleboCharges
// ====================================================

export interface getPhleboCharges_getPhleboCharges {
  __typename: "getPhleboChargesResponse";
  charges: number;
  distanceCharges: number | null;
}

export interface getPhleboCharges {
  getPhleboCharges: getPhleboCharges_getPhleboCharges | null;
}

export interface getPhleboChargesVariables {
  chargeDetailsInput?: ChargeDetailsInput | null;
}
