/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticSlots
// ====================================================

export interface getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo {
  __typename: "SlotInfo";
  endTime: string | null;
  status: string | null;
  startTime: string | null;
  slot: string | null;
}

export interface getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot {
  __typename: "EmployeeSlots";
  employeeCode: string | null;
  employeeName: string | null;
  slotInfo: (getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo | null)[] | null;
}

export interface getDiagnosticSlots_getDiagnosticSlots {
  __typename: "DiagnosticSlotsResult";
  diagnosticBranchCode: string | null;
  diagnosticSlot: (getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot | null)[] | null;
}

export interface getDiagnosticSlots {
  getDiagnosticSlots: getDiagnosticSlots_getDiagnosticSlots;
}

export interface getDiagnosticSlotsVariables {
  patientId?: string | null;
  hubCode?: string | null;
  selectedDate?: any | null;
  zipCode?: number | null;
}
