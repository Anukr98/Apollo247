/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DiagnosticsServiceability } from "./globalTypes";

// ====================================================
// GraphQL query operation: getUpcomingSlotInfo
// ====================================================

export interface getUpcomingSlotInfo {
  getUpcomingSlotInfo: string;
}

export interface getUpcomingSlotInfoVariables {
  latitude: number;
  longitude: number;
  zipcode: string;
  serviceability: DiagnosticsServiceability;
}
