/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateDoctorFavouriteAdvice
// ====================================================

export interface UpdateDoctorFavouriteAdvice_updateDoctorFavouriteAdvice_adviceList {
  __typename: "DoctorsFavouriteAdvice";
  id: string;
  instruction: string;
}

export interface UpdateDoctorFavouriteAdvice_updateDoctorFavouriteAdvice {
  __typename: "FavouriteAdviceList";
  adviceList: (UpdateDoctorFavouriteAdvice_updateDoctorFavouriteAdvice_adviceList | null)[] | null;
}

export interface UpdateDoctorFavouriteAdvice {
  updateDoctorFavouriteAdvice: UpdateDoctorFavouriteAdvice_updateDoctorFavouriteAdvice | null;
}

export interface UpdateDoctorFavouriteAdviceVariables {
  id: string;
  instruction: string;
}
