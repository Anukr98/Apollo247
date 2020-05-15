/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllSpecialties
// ====================================================

export interface GetAllSpecialties_getAllSpecialties {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  image: string | null;
  specialistSingularTerm: string | null;
  specialistPluralTerm: string | null;
  userFriendlyNomenclature: string | null;
  displayOrder: number | null;
}

export interface GetAllSpecialties {
  getAllSpecialties: GetAllSpecialties_getAllSpecialties[];
}
