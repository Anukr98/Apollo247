/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SPECIALTY_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: getAllSpecialties
// ====================================================

export interface getAllSpecialties_getAllSpecialties {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  image: string | null;
  specialistSingularTerm: string | null;
  specialistPluralTerm: string | null;
  slugName: string | null;
  userFriendlyNomenclature: string | null;
  shortDescription: string | null;
  symptoms: string | null;
}

export interface getAllSpecialties {
  getAllSpecialties: getAllSpecialties_getAllSpecialties[];
}

export interface getAllSpecialtiesVariables {
  specialtyStatus?: SPECIALTY_STATUS | null;
}
