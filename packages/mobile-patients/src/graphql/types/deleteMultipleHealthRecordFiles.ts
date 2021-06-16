/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DeleteMultipleHealthRecordFilesInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: deleteMultipleHealthRecordFiles
// ====================================================

export interface deleteMultipleHealthRecordFiles_deleteMultipleHealthRecordFiles {
  __typename: "DeleteHealthRecordResult";
  status: boolean | null;
}

export interface deleteMultipleHealthRecordFiles {
  deleteMultipleHealthRecordFiles: deleteMultipleHealthRecordFiles_deleteMultipleHealthRecordFiles;
}

export interface deleteMultipleHealthRecordFilesVariables {
  deleteMultipleHealthRecordFilesInput?: DeleteMultipleHealthRecordFilesInput | null;
}
