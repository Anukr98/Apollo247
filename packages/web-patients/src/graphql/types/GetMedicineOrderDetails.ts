/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetMedicineOrderDetails
// ====================================================

export interface GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails {
  __typename: "MedicineOrders";
  id: string;
  orderAutoId: number | null;
  shopId: string | null;
  estimatedAmount: number | null;
  deliveryType: MEDICINE_DELIVERY_TYPE;
  patientAddressId: string | null;
  devliveryCharges: number | null;
  prescriptionImageUrl: string | null;
  prismPrescriptionFileId: string | null;
  pharmaRequest: string | null;
  orderTat: string | null;
  orderType: MEDICINE_ORDER_TYPE | null;
}

export interface GetMedicineOrderDetails_getMedicineOrderDetails {
  __typename: "MedicineOrderDetailsResult";
  MedicineOrderDetails: GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails | null;
}

export interface GetMedicineOrderDetails {
  getMedicineOrderDetails: GetMedicineOrderDetails_getMedicineOrderDetails;
}

export interface GetMedicineOrderDetailsVariables {
  patientId: string;
  orderAutoId: number;
}
