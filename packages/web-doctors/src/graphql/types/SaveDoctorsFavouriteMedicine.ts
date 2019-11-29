/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SaveDoctorsFavouriteMedicineInput, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveDoctorsFavouriteMedicine
// ====================================================

export interface SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine_medicineList {
  __typename: "DoctorFavouriteMedicine";
  id: string;
  medicineName: string;
  medicineUnit: string | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineInstructions: string | null;
  medicineConsumptionDurationInDays: number | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineDosage: string | null;
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
