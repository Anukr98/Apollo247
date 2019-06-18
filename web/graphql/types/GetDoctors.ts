/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDoctors
// ====================================================

export interface GetDoctors_doctors {
  __typename: "Doctor";
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export interface GetDoctors {
  doctors: GetDoctors_doctors[] | null;
}
