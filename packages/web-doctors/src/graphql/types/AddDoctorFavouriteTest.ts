/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddDoctorFavouriteTest
// ====================================================

export interface AddDoctorFavouriteTest_addDoctorFavouriteTest_testList {
  __typename: "DoctorsFavouriteTests";
  itemname: string;
}

export interface AddDoctorFavouriteTest_addDoctorFavouriteTest {
  __typename: "FavouriteTestList";
  testList: (AddDoctorFavouriteTest_addDoctorFavouriteTest_testList | null)[] | null;
}

export interface AddDoctorFavouriteTest {
  addDoctorFavouriteTest: AddDoctorFavouriteTest_addDoctorFavouriteTest | null;
}

export interface AddDoctorFavouriteTestVariables {
  itemname: string;
}
