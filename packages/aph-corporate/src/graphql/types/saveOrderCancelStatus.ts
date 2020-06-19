/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderCancelInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: saveOrderCancelStatus
// ====================================================

export interface saveOrderCancelStatus_saveOrderCancelStatus {
  __typename: "OrderCancelResult";
  requestStatus: string | null;
  requestMessage: string | null;
}

export interface saveOrderCancelStatus {
  saveOrderCancelStatus: saveOrderCancelStatus_saveOrderCancelStatus;
}

export interface saveOrderCancelStatusVariables {
  orderCancelInput?: OrderCancelInput | null;
}
