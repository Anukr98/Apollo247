/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DeleteHealthRecordFilesInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: deleteHealthRecordFiles
// ====================================================

export interface deleteHealthRecordFiles_deleteHealthRecordFiles {
  __typename: "DeleteHealthRecordResult";
  status: boolean | null;
}

export interface deleteHealthRecordFiles {
  deleteHealthRecordFiles: deleteHealthRecordFiles_deleteHealthRecordFiles;
}

export interface deleteHealthRecordFilesVariables {
  deleteHealthRecordFilesInput?: DeleteHealthRecordFilesInput | null;
}
