/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetMedicineOrdersList
// ====================================================

export interface GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus {
  __typename: "MedicineOrdersStatus";
  id: string;
  orderStatus: MEDICINE_ORDER_STATUS | null;
  statusDate: any | null;
  hideStatus: boolean | null;
}

export interface GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList {
  __typename: "MedicineOrders";
  id: string;
  orderAutoId: number | null;
  deliveryType: MEDICINE_DELIVERY_TYPE;
  medicineOrdersStatus: (GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus | null)[] | null;
}

export interface GetMedicineOrdersList_getMedicineOrdersList {
  __typename: "MedicineOrdersListResult";
  MedicineOrdersList: (GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList | null)[] | null;
}

export interface GetMedicineOrdersList {
  getMedicineOrdersList: GetMedicineOrdersList_getMedicineOrdersList;
}

export interface GetMedicineOrdersListVariables {
  patientId?: string | null;
}
