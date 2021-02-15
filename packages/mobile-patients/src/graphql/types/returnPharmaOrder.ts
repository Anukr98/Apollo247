/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ReturnPharmaOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: returnPharmaOrder
// ====================================================

export interface returnPharmaOrder_returnPharmaOrder {
  __typename: "returnOrderResponse";
  status: string | null;
}

export interface returnPharmaOrder {
  returnPharmaOrder: returnPharmaOrder_returnPharmaOrder | null;
}

export interface returnPharmaOrderVariables {
  returnPharmaOrderInput?: ReturnPharmaOrderInput | null;
}
