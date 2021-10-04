/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VACCINE_TYPE, Relation } from "./globalTypes";

// ====================================================
// GraphQL query operation: getCorporateVaccinePlanValidation
// ====================================================

export interface getCorporateVaccinePlanValidation_getCorporateVaccinePlanValidation_response {
  __typename: "CorporateVaccineSubscription";
  corporate_vaccination_allow: boolean | null;
  remaining_vaccination: number | null;
  vaccine_dose_allowed: number | null;
  vaccine_type: VACCINE_TYPE | null;
  relation: Relation | null;
  total_corporate_appointment: number | null;
  user_message:string | "";
}

export interface getCorporateVaccinePlanValidation_getCorporateVaccinePlanValidation {
  __typename: "CorporateValidationResponseType";
  code: number;
  success: boolean;
  response: getCorporateVaccinePlanValidation_getCorporateVaccinePlanValidation_response | null;
}

export interface getCorporateVaccinePlanValidation {
  getCorporateVaccinePlanValidation: getCorporateVaccinePlanValidation_getCorporateVaccinePlanValidation;
}

export interface getCorporateVaccinePlanValidationVariables {
  patient_id: string;
}
