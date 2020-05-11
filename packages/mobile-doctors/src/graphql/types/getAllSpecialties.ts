/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getAllSpecialties
// ====================================================

export interface getAllSpecialties_getAllSpecialties {
  __typename: "DoctorSpecialty";
  id: string;
  name: string;
  image: string | null;
  userFriendlyNomenclature: string | null;
}

export interface getAllSpecialties {
  getAllSpecialties: getAllSpecialties_getAllSpecialties[];
}
