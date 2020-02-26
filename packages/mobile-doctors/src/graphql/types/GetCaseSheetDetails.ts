/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCaseSheetDetails
// ====================================================

export interface GetCaseSheetDetails_getCaseSheet_caseSheetDetails {
  __typename: "CaseSheet";
  id: string | null;
  blobName: string | null;
  doctorId: string | null;
  sentToPatient: boolean | null;
  status: string | null;
}

export interface GetCaseSheetDetails_getCaseSheet {
  __typename: "CaseSheetFullDetails";
  caseSheetDetails: GetCaseSheetDetails_getCaseSheet_caseSheetDetails | null;
}

export interface GetCaseSheetDetails {
  getCaseSheet: GetCaseSheetDetails_getCaseSheet | null;
}

export interface GetCaseSheetDetailsVariables {
  appointmentId: string;
}
