/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMedicineOrderShipmentDetails
// ====================================================

export interface GetMedicineOrderShipmentDetails_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments {
  __typename: "MedicineOrderOMSShipment";
  trackingNo: string | null;
  trackingProvider: string | null;
}

export interface GetMedicineOrderShipmentDetails_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails {
  __typename: "MedicineOrdersOMS";
  medicineOrderShipments: (GetMedicineOrderShipmentDetails_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments | null)[] | null;
}

export interface GetMedicineOrderShipmentDetails_getMedicineOrderOMSDetailsWithAddress {
  __typename: "MedicineOrderOMSDetailsResult";
  medicineOrderDetails: GetMedicineOrderShipmentDetails_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails | null;
}

export interface GetMedicineOrderShipmentDetails {
  getMedicineOrderOMSDetailsWithAddress: GetMedicineOrderShipmentDetails_getMedicineOrderOMSDetailsWithAddress;
}

export interface GetMedicineOrderShipmentDetailsVariables {
  patientId?: string | null;
  orderAutoId?: number | null;
  billNumber?: string | null;
}
