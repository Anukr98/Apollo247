/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { slotInfo, DiagnosticsRescheduleSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: rescheduleDiagnosticsOrderv2
// ====================================================

export interface rescheduleDiagnosticsOrderv2_rescheduleDiagnosticsOrderv2 {
  __typename: "rescheduleDiagnosticOrderv2Response";
  status: boolean | null;
  message: string | null;
  rescheduleCount: number;
}

export interface rescheduleDiagnosticsOrderv2 {
  rescheduleDiagnosticsOrderv2: rescheduleDiagnosticsOrderv2_rescheduleDiagnosticsOrderv2 | null;
}

export interface rescheduleDiagnosticsOrderv2Variables {
  parentOrderID: string;
  slotInfo: slotInfo;
  selectedDate: any;
  comment?: string | null;
  reason: string;
  source?: DiagnosticsRescheduleSource | null;
}
