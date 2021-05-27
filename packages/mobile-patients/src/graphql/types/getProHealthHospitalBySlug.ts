/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getProHealthHospitalBySlug
// ====================================================

export interface getProHealthHospitalBySlug_getProHealthHospitalBySlug_hospitals {
  __typename: "ProhealthHospitalByCity";
  id: string;
}

export interface getProHealthHospitalBySlug_getProHealthHospitalBySlug {
  __typename: "ProhealthHospitalDetailsBySlug";
  hospitals: (getProHealthHospitalBySlug_getProHealthHospitalBySlug_hospitals | null)[] | null;
}

export interface getProHealthHospitalBySlug {
  getProHealthHospitalBySlug: getProHealthHospitalBySlug_getProHealthHospitalBySlug | null;
}

export interface getProHealthHospitalBySlugVariables {
  hospitalSlug: string;
}
