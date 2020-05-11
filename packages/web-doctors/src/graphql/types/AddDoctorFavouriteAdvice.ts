/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddDoctorFavouriteAdvice
// ====================================================

export interface AddDoctorFavouriteAdvice_addDoctorFavouriteAdvice_adviceList {
  __typename: "DoctorsFavouriteAdvice";
  id: string;
  instruction: string;
}

export interface AddDoctorFavouriteAdvice_addDoctorFavouriteAdvice {
  __typename: "FavouriteAdviceList";
  adviceList: (AddDoctorFavouriteAdvice_addDoctorFavouriteAdvice_adviceList | null)[] | null;
}

export interface AddDoctorFavouriteAdvice {
  addDoctorFavouriteAdvice: AddDoctorFavouriteAdvice_addDoctorFavouriteAdvice | null;
}

export interface AddDoctorFavouriteAdviceVariables {
  instruction: string;
}
