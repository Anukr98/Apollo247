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
  statusMessage: string | null;
}

export interface getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrderLineItems {
  __typename: "MedicineOrderOMSLineItems";
  medicineName: string | null;
}

export interface getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrderShipments_medicineOrderInvoice {
  __typename: "MedicineOrderOMSInvoice";
  itemDetails: string | null;
}

export interface getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrderShipments {
  __typename: "MedicineOrderOMSShipment";
  medicineOrderInvoice: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrderShipments_medicineOrderInvoice | null)[] | null;
}

export interface getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList {
  __typename: "MedicineOrdersOMS";
  id: string;
  createdDate: any | null;
  orderAutoId: number | null;
  billNumber: string | null;
  shopAddress: string | null;
  deliveryType: MEDICINE_DELIVERY_TYPE;
  currentStatus: MEDICINE_ORDER_STATUS | null;
  oldOrderTat: string | null;
  orderTat: string | null;
  medicineOrdersStatus: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus | null)[] | null;
  medicineOrderLineItems: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrderLineItems | null)[] | null;
  medicineOrderShipments: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrderShipments | null)[] | null;
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
