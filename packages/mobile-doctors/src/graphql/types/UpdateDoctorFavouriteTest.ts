/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateDoctorFavouriteTest
// ====================================================

export interface UpdateDoctorFavouriteTest_updateDoctorFavouriteTest_testList {
  __typename: "DoctorsFavouriteTests";
  id: string;
  itemname: string;
}

export interface UpdateDoctorFavouriteTest_updateDoctorFavouriteTest {
  __typename: "FavouriteTestList";
  testList: (UpdateDoctorFavouriteTest_updateDoctorFavouriteTest_testList | null)[] | null;
}

export interface UpdateDoctorFavouriteTest {
  updateDoctorFavouriteTest: UpdateDoctorFavouriteTest_updateDoctorFavouriteTest | null;
}

export interface UpdateDoctorFavouriteTestVariables {
  id: string;
  itemname: string;
}
