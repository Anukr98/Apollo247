/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateDoctorsFavouriteMedicineInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateDoctorFavouriteMedicine
// ====================================================

export interface UpdateDoctorFavouriteMedicine_updateDoctorFavouriteMedicine_medicineList {
  __typename: "DoctorFavouriteMedicine";
  id: string | null;
}

export interface UpdateDoctorFavouriteMedicine_updateDoctorFavouriteMedicine {
  __typename: "FavouriteMedicineList";
  medicineList: (UpdateDoctorFavouriteMedicine_updateDoctorFavouriteMedicine_medicineList | null)[] | null;
}

export interface UpdateDoctorFavouriteMedicine {
  updateDoctorFavouriteMedicine: UpdateDoctorFavouriteMedicine_updateDoctorFavouriteMedicine | null;
}

export interface UpdateDoctorFavouriteMedicineVariables {
  updateDoctorsFavouriteMedicineInput?: UpdateDoctorsFavouriteMedicineInput | null;
}
