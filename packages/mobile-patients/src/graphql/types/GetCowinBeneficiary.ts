/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GetCowinBeneficiaryInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCowinBeneficiary
// ====================================================

export interface GetCowinBeneficiary_getCowinBeneficiary_response {
  __typename: "Beneficiary";
  beneficiary_reference_id: string | null;
  name: string | null;
  photo_id_type: string | null;
  photo_id_number: string | null;
  vaccination_status: string | null;
  vaccine: string | null;
  dose1_date: string | null;
  dose2_date: string | null;
}

export interface GetCowinBeneficiary_getCowinBeneficiary {
  __typename: "CowinGetBeneficiaryResponse";
  code: number;
  message: string | null;
  response: GetCowinBeneficiary_getCowinBeneficiary_response[] | null;
}

export interface GetCowinBeneficiary {
  getCowinBeneficiary: GetCowinBeneficiary_getCowinBeneficiary;
}

export interface GetCowinBeneficiaryVariables {
  getCowinBeneficiary: GetCowinBeneficiaryInput;
}
