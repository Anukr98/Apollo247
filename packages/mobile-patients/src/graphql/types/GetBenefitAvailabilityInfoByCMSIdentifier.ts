/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetBenefitAvailabilityInfoByCMSIdentifier
// ====================================================

export interface GetBenefitAvailabilityInfoByCMSIdentifier_GetBenefitAvailabilityInfoByCMSIdentifier {
  __typename: "BenefitAvailabilityResponse";
  response: any | null;
}

export interface GetBenefitAvailabilityInfoByCMSIdentifier {
  GetBenefitAvailabilityInfoByCMSIdentifier: GetBenefitAvailabilityInfoByCMSIdentifier_GetBenefitAvailabilityInfoByCMSIdentifier;
}

export interface GetBenefitAvailabilityInfoByCMSIdentifierVariables {
  user_subscription_id: string;
  cms_identifier: string;
}
