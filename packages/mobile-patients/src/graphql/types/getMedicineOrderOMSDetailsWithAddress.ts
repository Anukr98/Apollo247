/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MEDICINE_ORDER_TYPE, MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_STATUS, MEDICINE_ORDER_PAYMENT_TYPE, PAYMENT_METHODS_REVERSE, REFUND_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getMedicineOrderOMSDetailsWithAddress
// ====================================================

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderLineItems {
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

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderPayments_healthCreditsRedemptionRequest {
  __typename: "BlockUserPointsResponse";
  Success: boolean | null;
  Message: string | null;
  RequestNumber: string | null;
  AvailablePoints: number | null;
  BalancePoints: number | null;
  RedeemedPoints: number | null;
  PointsValue: number | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderPayments {
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
  healthCreditsRedeemed: number | null;
  healthCreditsRedemptionRequest: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderPayments_healthCreditsRedemptionRequest | null;
  paymentMode: PAYMENT_METHODS_REVERSE | null;
  refundAmount: number | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderRefunds {
  __typename: "MedicineOrderOMSRefunds";
  refundAmount: number | null;
  refundStatus: REFUND_STATUS | null;
  refundId: string | null;
  orderId: string | null;
  createdDate: any | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus {
  __typename: "MedicineOrdersOMSStatus";
  id: string;
  orderStatus: MEDICINE_ORDER_STATUS | null;
  statusDate: any | null;
  hideStatus: boolean | null;
  statusMessage: string | null;
  customReason: string | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments_driverDetails {
  __typename: "DriverDetails";
  driverName: string | null;
  driverPhone: string | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments_medicineOrdersStatus {
  __typename: "MedicineOrdersOMSStatus";
  id: string;
  orderStatus: MEDICINE_ORDER_STATUS | null;
  statusDate: any | null;
  hideStatus: boolean | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments_medicineOrderInvoice {
  __typename: "MedicineOrderOMSInvoice";
  id: string;
  siteId: string | null;
  remarks: string | null;
  requestType: string | null;
  vendorName: string | null;
  billDetails: string | null;
  itemDetails: string | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments {
  __typename: "MedicineOrderOMSShipment";
  driverDetails: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments_driverDetails | null;
  id: string;
  siteId: string | null;
  siteName: string | null;
  trackingNo: string | null;
  trackingProvider: string | null;
  updatedDate: string | null;
  currentStatus: MEDICINE_ORDER_STATUS | null;
  itemDetails: string | null;
  trackingUrl: string | null;
  medicineOrdersStatus: (getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments_medicineOrdersStatus | null)[] | null;
  medicineOrderInvoice: (getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments_medicineOrderInvoice | null)[] | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_patient_addressList {
  __typename: "PatientAddress";
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_patient {
  __typename: "Patient";
  mobileNumber: string;
  id: string;
  firstName: string | null;
  lastName: string | null;
  addressList: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_patient_addressList[] | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderAddress {
  __typename: "MedicineOrderOMSAddress";
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails {
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
  oldOrderTat: string | null;
  orderType: MEDICINE_ORDER_TYPE | null;
  shopAddress: string | null;
  packagingCharges: number | null;
  deliveryType: MEDICINE_DELIVERY_TYPE;
  currentStatus: MEDICINE_ORDER_STATUS | null;
  patientAddressId: string | null;
  alertStore: boolean | null;
  prescriptionOptionSelected: string | null;
  tatType: string | null;
  shopId: string | null;
  totalCashBack: number | null;
  medicineOrderLineItems: (getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderLineItems | null)[] | null;
  medicineOrderPayments: (getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderPayments | null)[] | null;
  medicineOrderRefunds: (getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderRefunds | null)[] | null;
  medicineOrdersStatus: (getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus | null)[] | null;
  medicineOrderShipments: (getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderShipments | null)[] | null;
  patient: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_patient | null;
  medicineOrderAddress: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrderAddress | null;
}

export interface getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress {
  __typename: "MedicineOrderOMSDetailsResult";
  medicineOrderDetails: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails | null;
}

export interface getMedicineOrderOMSDetailsWithAddress {
  getMedicineOrderOMSDetailsWithAddress: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress;
}

export interface getMedicineOrderOMSDetailsWithAddressVariables {
  patientId?: string | null;
  orderAutoId?: number | null;
  billNumber?: string | null;
}
