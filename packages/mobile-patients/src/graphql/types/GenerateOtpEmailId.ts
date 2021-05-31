/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GenerateOtpEmailId
// ====================================================

export interface GenerateOtpEmailId_GenerateOtpEmailId {
  __typename: "authenticateEmailIdResponse";
  status: boolean | null;
  loginId: string | null;
  message: string | null;
}

export interface GenerateOtpEmailId {
  GenerateOtpEmailId: GenerateOtpEmailId_GenerateOtpEmailId;
}

export interface GenerateOtpEmailIdVariables {
  email: string;
}
