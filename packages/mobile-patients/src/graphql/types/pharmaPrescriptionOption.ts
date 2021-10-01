/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PharmaPrescriptionOptionInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: pharmaPrescriptionOption
// ====================================================

export interface pharmaPrescriptionOption_pharmaPrescriptionOption_pharmaPrescriptionOption {
  __typename: "PharmaPrescriptionOption";
  id: string | null;
  title: string | null;
  visible: boolean | null;
}

export interface pharmaPrescriptionOption_pharmaPrescriptionOption {
  __typename: "PharmaPrescriptionOptionResponse";
  pharmaPrescriptionOption: (pharmaPrescriptionOption_pharmaPrescriptionOption_pharmaPrescriptionOption | null)[] | null;
}

export interface pharmaPrescriptionOption {
  pharmaPrescriptionOption: pharmaPrescriptionOption_pharmaPrescriptionOption | null;
}

export interface pharmaPrescriptionOptionVariables {
  pharmaPrescriptionOptionInput?: PharmaPrescriptionOptionInput | null;
}
