/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDiagnosticItDoseSlots
// ====================================================

export interface GetDiagnosticItDoseSlots_getDiagnosticItDoseSlots_slotInfo {
  __typename: "ItdoseSlotInfo";
  TimeslotID: string | null;
  Timeslot: string | null;
}

export interface GetDiagnosticItDoseSlots_getDiagnosticItDoseSlots {
  __typename: "DiagnosticItdoseSlotsResult";
  slotInfo: (GetDiagnosticItDoseSlots_getDiagnosticItDoseSlots_slotInfo | null)[] | null;
}

export interface GetDiagnosticItDoseSlots {
  getDiagnosticItDoseSlots: GetDiagnosticItDoseSlots_getDiagnosticItDoseSlots;
}

export interface GetDiagnosticItDoseSlotsVariables {
  patientId?: string | null;
  selectedDate?: any | null;
  zipCode?: number | null;
}
