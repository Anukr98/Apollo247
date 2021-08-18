/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DiagnosticsServiceability } from "./globalTypes";

// ====================================================
// GraphQL query operation: getUpcomingSlotInfo
// ====================================================

export interface getUpcomingSlotInfo_getUpcomingSlotInfo {
  __typename: "UpComingSlotInfo";
  status: boolean;
  slotInfo: string;
}

export interface getUpcomingSlotInfo {
  getUpcomingSlotInfo: getUpcomingSlotInfo_getUpcomingSlotInfo;
}

export interface getUpcomingSlotInfoVariables {
  latitude: number;
  longitude: number;
  zipcode: string;
  serviceability: DiagnosticsServiceability;
}
