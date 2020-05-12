/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveFavouriteMedicine
// ====================================================

export interface RemoveFavouriteMedicine_removeFavouriteMedicine_medicineList {
  __typename: "DoctorFavouriteMedicine";
  id: string | null;
}

export interface RemoveFavouriteMedicine_removeFavouriteMedicine {
  __typename: "FavouriteMedicineList";
  medicineList: (RemoveFavouriteMedicine_removeFavouriteMedicine_medicineList | null)[] | null;
}

export interface RemoveFavouriteMedicine {
  removeFavouriteMedicine: RemoveFavouriteMedicine_removeFavouriteMedicine;
}

export interface RemoveFavouriteMedicineVariables {
  id?: string | null;
}
