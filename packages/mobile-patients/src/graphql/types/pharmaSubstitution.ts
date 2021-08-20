/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PharmaSubstitutionRequest } from "./globalTypes";

// ====================================================
// GraphQL query operation: pharmaSubstitution
// ====================================================

export interface pharmaSubstitution_pharmaSubstitution_substitutes {
  __typename: "SubstituteResponse";
  sku: string | null;
  name: string | null;
  price: number | null;
  mou: string | null;
  image: string | null;
  thumbnail: string | null;
  small_image: string | null;
  is_express: string | null;
  is_in_contract: string | null;
  is_prescription_required: string | null;
  description: string | null;
  subcategory: string | null;
  type_id: string | null;
  url_key: string | null;
  is_in_stock: number | null;
  MaxOrderQty: number | null;
  sell_online: number | null;
  manufacturer: string | null;
  dc_availability: string | null;
  tat: any | null;
  tatDuration: string | null;
  tatPrice: number | null;
}

export interface pharmaSubstitution_pharmaSubstitution {
  __typename: "PharmaSubstitutionResponse";
  substitutes: (pharmaSubstitution_pharmaSubstitution_substitutes | null)[] | null;
}

export interface pharmaSubstitution {
  pharmaSubstitution: pharmaSubstitution_pharmaSubstitution | null;
}

export interface pharmaSubstitutionVariables {
  substitutionInput?: PharmaSubstitutionRequest | null;
}
