/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MEDICINE_ORDER_TYPE, MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_STATUS, MEDICINE_ORDER_PAYMENT_TYPE } from "./globalTypes";

// ====================================================
// GraphQL query operation: getMedicineOrderOMSDetails
// ====================================================

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems {
  __typename: "MedicineOrderOMSLineItems";
  medicineSKU: string | null;
  medicineName: string | null;
  price: number | null;
  mrp: number | null;
  quantity: number | null;
  isMedicine: string | null;
  mou: number | null;
  isPrescriptionNeeded: number | null;
}

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderPayments {
  __typename: "MedicineOrderOMSPayments";
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

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus {
  __typename: "MedicineOrdersOMSStatus";
  id: string;
  orderStatus: MEDICINE_ORDER_STATUS | null;
  statusDate: any | null;
  hideStatus: boolean | null;
  statusMessage: string | null;
  customReason: string | null;
}

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderShipments_medicineOrdersStatus {
  __typename: "MedicineOrdersOMSStatus";
  id: string;
  orderStatus: MEDICINE_ORDER_STATUS | null;
  statusDate: any | null;
  hideStatus: boolean | null;
}

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderShipments_medicineOrderInvoice {
  __typename: "MedicineOrderOMSInvoice";
  id: string;
  siteId: string | null;
  remarks: string | null;
  requestType: string | null;
  vendorName: string | null;
  billDetails: string | null;
  itemDetails: string | null;
}

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderShipments {
  __typename: "MedicineOrderOMSShipment";
  id: string;
  siteId: string | null;
  siteName: string | null;
  apOrderNo: string | null;
  updatedDate: string | null;
  currentStatus: MEDICINE_ORDER_STATUS | null;
  itemDetails: string | null;
  medicineOrdersStatus: (getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderShipments_medicineOrdersStatus | null)[] | null;
  medicineOrderInvoice: (getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderShipments_medicineOrderInvoice | null)[] | null;
}

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_patient_addressList {
  __typename: "PatientAddress";
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
}

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_patient {
  __typename: "Patient";
  mobileNumber: string;
  id: string;
  firstName: string | null;
  lastName: string | null;
  addressList: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_patient_addressList[] | null;
}

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails {
  __typename: "MedicineOrdersOMS";
  id: string;
  createdDate: any | null;
  orderAutoId: number | null;
  billNumber: string | null;
  coupon: string | null;
  devliveryCharges: number | null;
  prismPrescriptionFileId: string | null;
  couponDiscount: number | null;
  productDiscount: number | null;
  redeemedAmount: number | null;
  estimatedAmount: number | null;
  prescriptionImageUrl: string | null;
  orderTat: string | null;
  orderType: MEDICINE_ORDER_TYPE | null;
  shopAddress: string | null;
  packagingCharges: number | null;
  deliveryType: MEDICINE_DELIVERY_TYPE;
  currentStatus: MEDICINE_ORDER_STATUS | null;
  patientAddressId: string | null;
  alertStore: boolean | null;
  medicineOrderLineItems: (getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems | null)[] | null;
  medicineOrderPayments: (getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderPayments | null)[] | null;
  medicineOrdersStatus: (getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus | null)[] | null;
  medicineOrderShipments: (getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderShipments | null)[] | null;
  patient: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_patient | null;
}

export interface getMedicineOrderOMSDetails_getMedicineOrderOMSDetails {
  __typename: "MedicineOrderOMSDetailsResult";
  medicineOrderDetails: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails | null;
}

export interface getMedicineOrderOMSDetails {
  getMedicineOrderOMSDetails: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails;
}

export interface getMedicineOrderOMSDetailsVariables {
  patientId?: string | null;
  orderAutoId?: number | null;
  billNumber?: string | null;
}
