/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PreviousOrdersSkus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: getPreviousOrdersSkus
// ====================================================

export interface getPreviousOrdersSkus_getPreviousOrdersSkus {
  __typename: "SkuDetailsResult";
  SkuDetails: (string | null)[] | null;
}

export interface getPreviousOrdersSkus {
  getPreviousOrdersSkus: getPreviousOrdersSkus_getPreviousOrdersSkus;
}

export interface getPreviousOrdersSkusVariables {
  previousOrdersSkus?: PreviousOrdersSkus | null;
}
