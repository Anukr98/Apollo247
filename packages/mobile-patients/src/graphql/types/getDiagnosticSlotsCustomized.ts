/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticSlotsCustomized
// ====================================================

export interface getDiagnosticSlotsCustomized_getDiagnosticSlotsCustomized_slots {
  __typename: "ItdoseSlotInfo";
  Timeslot: string | null;
  TimeslotID: string | null;
}

export interface getDiagnosticSlotsCustomized_getDiagnosticSlotsCustomized {
  __typename: "DiagnosticSlotsWithAreaIDResult";
  slots: (getDiagnosticSlotsCustomized_getDiagnosticSlotsCustomized_slots | null)[] | null;
}

export interface getDiagnosticSlotsCustomized {
  getDiagnosticSlotsCustomized: getDiagnosticSlotsCustomized_getDiagnosticSlotsCustomized;
}

export interface getDiagnosticSlotsCustomizedVariables {
  selectedDate: any;
  areaID: number;
  itemIds: number[];
}
