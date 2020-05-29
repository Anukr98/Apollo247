/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteDoctorFavouriteAdvice
// ====================================================

export interface DeleteDoctorFavouriteAdvice_deleteDoctorFavouriteAdvice_adviceList {
  __typename: "DoctorsFavouriteAdvice";
  id: string;
  instruction: string;
}

export interface DeleteDoctorFavouriteAdvice_deleteDoctorFavouriteAdvice {
  __typename: "FavouriteAdviceList";
  adviceList: (DeleteDoctorFavouriteAdvice_deleteDoctorFavouriteAdvice_adviceList | null)[] | null;
}

export interface DeleteDoctorFavouriteAdvice {
  deleteDoctorFavouriteAdvice: DeleteDoctorFavouriteAdvice_deleteDoctorFavouriteAdvice | null;
}

export interface DeleteDoctorFavouriteAdviceVariables {
  instructionId: string;
}
