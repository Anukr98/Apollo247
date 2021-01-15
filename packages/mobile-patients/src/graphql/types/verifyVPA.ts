/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VerifyVPA } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: verifyVPA
// ====================================================

export interface verifyVPA_verifyVPA {
  __typename: "VerifyVPAResponse";
  vpa: string | null;
  status: string | null;
  customer_name: string | null;
}

export interface verifyVPA {
  verifyVPA: verifyVPA_verifyVPA;
}

export interface verifyVPAVariables {
  verifyVPA?: VerifyVPA | null;
}
