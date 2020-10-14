/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDiagnosticSlotsWithAreaID
// ====================================================

export interface getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID_slots {
  __typename: "ItdoseSlotInfo";
  Timeslot: string | null;
  TimeslotID: string | null;
}

export interface getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID {
  __typename: "DiagnosticSlotsWithAreaIDResult";
  slots: (getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID_slots | null)[] | null;
}

export interface getDiagnosticSlotsWithAreaID {
  getDiagnosticSlotsWithAreaID: getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID;
}

export interface getDiagnosticSlotsWithAreaIDVariables {
  selectedDate: any;
  areaID: number;
}
