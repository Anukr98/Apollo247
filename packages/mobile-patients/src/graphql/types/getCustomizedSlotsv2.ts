/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { patientAddressObj, patientObjWithLineItems, DiagnosticsServiceability, DiagnosticsBookingSource } from "./globalTypes";

// ====================================================
// GraphQL query operation: getCustomizedSlotsv2
// ====================================================

export interface getCustomizedSlotsv2_getCustomizedSlotsv2_available_slots_slotDetail {
  __typename: "slotDetailResponse";
  slotDisplayTime: string | null;
  internalSlots: (string | null)[] | null;
}

export interface getCustomizedSlotsv2_getCustomizedSlotsv2_available_slots {
  __typename: "slotInfoResponse";
  slotDetail: getCustomizedSlotsv2_getCustomizedSlotsv2_available_slots_slotDetail | null;
  isPaidSlot: boolean | null;
}

export interface getCustomizedSlotsv2_getCustomizedSlotsv2 {
  __typename: "getCustomizedSlotsv2Response";
  available_slots: (getCustomizedSlotsv2_getCustomizedSlotsv2_available_slots | null)[] | null;
  distanceCharges: number | null;
  slotDurationInMinutes: number | null;
}

export interface getCustomizedSlotsv2 {
  getCustomizedSlotsv2: getCustomizedSlotsv2_getCustomizedSlotsv2 | null;
}

export interface getCustomizedSlotsv2Variables {
  patientAddressObj: patientAddressObj;
  patientsObjWithLineItems?: (patientObjWithLineItems | null)[] | null;
  billAmount: number;
  selectedDate: any;
  serviceability?: DiagnosticsServiceability | null;
  diagnosticOrdersId?: string | null;
  patientAddressID?: string | null;
  bookingSource?: DiagnosticsBookingSource | null;
}
