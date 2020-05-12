/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDoctorFavouriteAdviceList
// ====================================================

export interface GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList {
  __typename: "DoctorsFavouriteAdvice";
  id: string;
  instruction: string;
}

export interface GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList {
  __typename: "FavouriteAdviceList";
  adviceList: (GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList | null)[] | null;
}

export interface GetDoctorFavouriteAdviceList {
  getDoctorFavouriteAdviceList: GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList | null;
}
