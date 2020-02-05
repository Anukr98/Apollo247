/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDoctorFavouriteTestList
// ====================================================

export interface GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList {
  __typename: "TestsWithAdditionalDetails";
  id: string | null;
  itemname: string | null;
}

export interface GetDoctorFavouriteTestList_getDoctorFavouriteTestList {
  __typename: "FormatedTestLists";
  testList: (GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList | null)[] | null;
}

export interface GetDoctorFavouriteTestList {
  getDoctorFavouriteTestList: GetDoctorFavouriteTestList_getDoctorFavouriteTestList | null;
}
