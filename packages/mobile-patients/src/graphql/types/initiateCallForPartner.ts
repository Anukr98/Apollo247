/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: initiateCallForPartner
// ====================================================

export interface initiateCallForPartner_initiateCallForPartner {
  __typename: "ExotelCallFlowResponse";
  success: boolean | null;
}

export interface initiateCallForPartner {
  initiateCallForPartner: initiateCallForPartner_initiateCallForPartner;
}

export interface initiateCallForPartnerVariables {
  mobileNumber: string;
  benefitId: string;
  userSubscriptionId?: string | null;
}
