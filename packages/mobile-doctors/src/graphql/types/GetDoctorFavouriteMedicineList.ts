/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MEDICINE_CONSUMPTION_DURATION, MEDICINE_FREQUENCY, MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN, MEDICINE_UNIT } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorFavouriteMedicineList
// ====================================================

export interface GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList {
  __typename: "DoctorFavouriteMedicine";
  externalId: string | null;
  id: string | null;
  medicineConsumptionDuration: string | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
  medicineDosage: string | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineInstructions: string | null;
  medicineName: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineUnit: MEDICINE_UNIT | null;
}

export interface GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList {
  __typename: "FavouriteMedicineList";
  medicineList: (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[] | null;
}

export interface GetDoctorFavouriteMedicineList {
  getDoctorFavouriteMedicineList: GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList | null;
}
