/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MEDICINE_ORDER_TYPE, MEDICINE_ORDER_STATUS, MEDICINE_ORDER_PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetMedicineOrderDetails
// ====================================================

export interface GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrderPayments {
  __typename: "MedicineOrderPayments";
  id: string;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE | null;
  amountPaid: number | null;
  paymentRefId: string | null;
  paymentStatus: string | null;
  paymentDateTime: any | null;
  responseCode: string | null;
  responseMessage: string | null;
  bankTxnId: string | null;
}

export interface GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrdersStatus {
  __typename: "MedicineOrdersStatus";
  id: string;
  orderStatus: MEDICINE_ORDER_STATUS | null;
  statusDate: any | null;
  hideStatus: boolean | null;
}

export interface GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrderLineItems {
  __typename: "MedicineOrderLineItems";
  medicineSKU: string | null;
  medicineName: string | null;
  price: number | null;
  mrp: number | null;
  quantity: number | null;
  isMedicine: string | null;
  mou: number | null;
}

export interface GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_patient_addressList {
  __typename: "PatientAddress";
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
}

export interface GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_patient {
  __typename: "Patient";
  firstName: string | null;
  lastName: string | null;
  addressList: GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_patient_addressList[] | null;
}

export interface GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails {
  __typename: "MedicineOrders";
  id: string;
  orderAutoId: number | null;
  devliveryCharges: number | null;
  estimatedAmount: number | null;
  prescriptionImageUrl: string | null;
  orderTat: string | null;
  orderType: MEDICINE_ORDER_TYPE | null;
  currentStatus: MEDICINE_ORDER_STATUS | null;
  patientAddressId: string | null;
  medicineOrderPayments: (GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrderPayments | null)[] | null;
  medicineOrdersStatus: (GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrdersStatus | null)[] | null;
  medicineOrderLineItems: (GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrderLineItems | null)[] | null;
  patient: GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_patient | null;
}

export interface GetMedicineOrderDetails_getMedicineOrderDetails {
  __typename: "MedicineOrderDetailsResult";
  MedicineOrderDetails: GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails | null;
}

export interface GetMedicineOrderDetails {
  getMedicineOrderDetails: GetMedicineOrderDetails_getMedicineOrderDetails;
}

export interface GetMedicineOrderDetailsVariables {
  patientId?: string | null;
  orderAutoId?: number | null;
}
