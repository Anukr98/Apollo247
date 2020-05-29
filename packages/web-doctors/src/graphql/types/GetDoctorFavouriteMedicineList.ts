/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MEDICINE_CONSUMPTION_DURATION, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_UNIT, MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN, ROUTE_OF_ADMINISTRATION } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDoctorFavouriteMedicineList
// ====================================================

export interface GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList {
  __typename: "DoctorFavouriteMedicine";
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDuration: string | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
  medicineFormTypes: MEDICINE_FORM_TYPES | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineDosage: string | null;
  medicineUnit: MEDICINE_UNIT | null;
  medicineInstructions: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineName: string | null;
  id: string | null;
  externalId: string | null;
  routeOfAdministration: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage: string | null;
}

export interface GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList {
  __typename: "GetDoctorFavouriteMedicineListResult";
  medicineList: (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[] | null;
  allowedDosages: (string | null)[] | null;
}

export interface GetDoctorFavouriteMedicineList {
  getDoctorFavouriteMedicineList: GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList | null;
}
