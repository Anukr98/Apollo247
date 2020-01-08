/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDoctorFavouriteTestList
// ====================================================

export interface GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList {
  __typename: "DoctorsFavouriteTests";
  id: string;
  itemname: string;
}

export interface GetDoctorFavouriteTestList_getDoctorFavouriteTestList {
  __typename: "FavouriteTestList";
  testList: (GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList | null)[] | null;
}

export interface GetDoctorFavouriteTestList {
  getDoctorFavouriteTestList: GetDoctorFavouriteTestList_getDoctorFavouriteTestList | null;
}
