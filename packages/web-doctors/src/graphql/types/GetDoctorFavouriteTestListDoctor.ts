/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDoctorFavouriteTestListDoctor
// ====================================================

export interface GetDoctorFavouriteTestListDoctor_getDoctorFavouriteTestList_testList {
  __typename: "DoctorsFavouriteTests";
  id: string;
  itemname: string;
}

export interface GetDoctorFavouriteTestListDoctor_getDoctorFavouriteTestList {
  __typename: "FavouriteTestList";
  testList: (GetDoctorFavouriteTestListDoctor_getDoctorFavouriteTestList_testList | null)[] | null;
}

export interface GetDoctorFavouriteTestListDoctor {
  getDoctorFavouriteTestList: GetDoctorFavouriteTestListDoctor_getDoctorFavouriteTestList | null;
}
