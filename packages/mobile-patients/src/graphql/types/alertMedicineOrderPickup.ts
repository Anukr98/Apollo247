/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AlertMedicineOrderPickupInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: alertMedicineOrderPickup
// ====================================================

export interface alertMedicineOrderPickup_alertMedicineOrderPickup {
  __typename: "AlertMedicineOrderPickupResult";
  status: boolean | null;
  message: string | null;
}

export interface alertMedicineOrderPickup {
  alertMedicineOrderPickup: alertMedicineOrderPickup_alertMedicineOrderPickup;
}

export interface alertMedicineOrderPickupVariables {
  alertMedicineOrderPickupInput?: AlertMedicineOrderPickupInput | null;
}
