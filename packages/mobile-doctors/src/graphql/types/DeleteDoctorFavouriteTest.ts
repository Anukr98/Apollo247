/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteDoctorFavouriteTest
// ====================================================

export interface DeleteDoctorFavouriteTest_deleteDoctorFavouriteTest_testList {
  __typename: "DoctorsFavouriteTests";
  id: string;
  itemname: string;
}

export interface DeleteDoctorFavouriteTest_deleteDoctorFavouriteTest {
  __typename: "FavouriteTestList";
  testList: (DeleteDoctorFavouriteTest_deleteDoctorFavouriteTest_testList | null)[] | null;
}

export interface DeleteDoctorFavouriteTest {
  deleteDoctorFavouriteTest: DeleteDoctorFavouriteTest_deleteDoctorFavouriteTest | null;
}

export interface DeleteDoctorFavouriteTestVariables {
  testId: string;
}
