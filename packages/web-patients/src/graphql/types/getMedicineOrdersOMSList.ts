/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getMedicineOrdersOMSList
// ====================================================

export interface getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus {
  __typename: "MedicineOrdersOMSStatus";
  id: string;
  statusDate: any | null;
  orderStatus: MEDICINE_ORDER_STATUS | null;
  hideStatus: boolean | null;
}

export interface getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList {
  __typename: "MedicineOrdersOMS";
  id: string;
  orderAutoId: number | null;
  deliveryType: MEDICINE_DELIVERY_TYPE;
  currentStatus: MEDICINE_ORDER_STATUS | null;
  medicineOrdersStatus: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus | null)[] | null;
}

export interface getMedicineOrdersOMSList_getMedicineOrdersOMSList {
  __typename: "MedicineOrdersOMSListResult";
  medicineOrdersList: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList | null)[] | null;
}

export interface getMedicineOrdersOMSList {
  getMedicineOrdersOMSList: getMedicineOrdersOMSList_getMedicineOrdersOMSList;
}

export interface getMedicineOrdersOMSListVariables {
  patientId?: string | null;
}
