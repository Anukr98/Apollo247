/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MEDICINE_UNIT, MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorFavouriteMedicineList
// ====================================================

export interface GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList {
  __typename: "DoctorFavouriteMedicine";
  medicineConsumptionDurationInDays: string | null;
  medicineDosage: string | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineName: string | null;
  id: string | null;
}

export interface GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList {
  __typename: "FavouriteMedicineList";
  medicineList: (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[] | null;
}

export interface GetDoctorFavouriteMedicineList {
  getDoctorFavouriteMedicineList: GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList | null;
}
