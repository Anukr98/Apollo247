/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SaveDoctorsFavouriteMedicineInput, MEDICINE_TO_BE_TAKEN, MEDICINE_TIMINGS } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveDoctorsFavouriteMedicine
// ====================================================

export interface SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine_favouriteMedicine {
  __typename: "DoctorFavouriteMedicine";
  id: string;
  doctorId: string | null;
  medicineName: string;
  medicineUnit: string | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineInstructions: string | null;
  medicineConsumptionDurationInDays: number | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineDosage: string | null;
}

export interface SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine {
  __typename: "DoctorFavouriteMedicineResult";
  favouriteMedicine: SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine_favouriteMedicine | null;
}

export interface SaveDoctorsFavouriteMedicine {
  saveDoctorsFavouriteMedicine: SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine;
}

export interface SaveDoctorsFavouriteMedicineVariables {
  saveDoctorsFavouriteMedicineInput?: SaveDoctorsFavouriteMedicineInput | null;
}
