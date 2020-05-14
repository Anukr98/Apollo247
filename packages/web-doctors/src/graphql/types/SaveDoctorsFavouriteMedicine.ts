/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SaveDoctorsFavouriteMedicineInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveDoctorsFavouriteMedicine
// ====================================================

export interface SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine_medicineList {
  __typename: "DoctorFavouriteMedicine";
  id: string | null;
}

export interface SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine {
  __typename: "FavouriteMedicineList";
  medicineList: (SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine_medicineList | null)[] | null;
}

export interface SaveDoctorsFavouriteMedicine {
  saveDoctorsFavouriteMedicine: SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine;
}

export interface SaveDoctorsFavouriteMedicineVariables {
  saveDoctorsFavouriteMedicineInput?: SaveDoctorsFavouriteMedicineInput | null;
}
