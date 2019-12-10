/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorFavouriteMedicineList
// ====================================================

export interface GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList {
  __typename: "DoctorFavouriteMedicine";
  medicineConsumptionDurationInDays: number | null;
  medicineDosage: string | null;
  medicineUnit: string | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineName: string;
  id: string;
}

export interface GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList {
  __typename: "FavouriteMedicineList";
  medicineList:
    | (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[]
    | null;
}

export interface GetDoctorFavouriteMedicineList {
  getDoctorFavouriteMedicineList: GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList | null;
}
