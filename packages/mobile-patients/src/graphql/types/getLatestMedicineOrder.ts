/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getLatestMedicineOrder
// ====================================================

export interface getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails_medicineOrderLineItems {
  __typename: "MedicineOrderOMSLineItems";
  medicineSKU: string | null;
  medicineName: string | null;
  price: number | null;
  mrp: number | null;
  quantity: number | null;
}

export interface getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails_medicineOrderShipments_medicineOrderInvoice {
  __typename: "MedicineOrderOMSInvoice";
  itemDetails: string | null;
}

export interface getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails_medicineOrderShipments {
  __typename: "MedicineOrderOMSShipment";
  medicineOrderInvoice: (getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails_medicineOrderShipments_medicineOrderInvoice | null)[] | null;
}

export interface getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails {
  __typename: "MedicineOrdersOMS";
  id: string;
  createdDate: any | null;
  orderAutoId: number | null;
  billNumber: string | null;
  shopAddress: string | null;
  prescriptionImageUrl: string | null;
  medicineOrderLineItems: (getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails_medicineOrderLineItems | null)[] | null;
  medicineOrderShipments: (getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails_medicineOrderShipments | null)[] | null;
}

export interface getLatestMedicineOrder_getLatestMedicineOrder {
  __typename: "MedicineOrderOMSDetailsResult";
  medicineOrderDetails: getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails | null;
}

export interface getLatestMedicineOrder {
  getLatestMedicineOrder: getLatestMedicineOrder_getLatestMedicineOrder;
}

export interface getLatestMedicineOrderVariables {
  patientUhid: string;
}
