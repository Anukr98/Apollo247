/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SaveDoctorsFavouriteMedicineInput, MEDICINE_CONSUMPTION_DURATION, MEDICINE_FORM_TYPES, MEDICINE_FREQUENCY, MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN, MEDICINE_UNIT, ROUTE_OF_ADMINISTRATION } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveDoctorsFavouriteMedicine
// ====================================================

export interface SaveDoctorsFavouriteMedicine_saveDoctorsFavouriteMedicine_medicineList {
  __typename: "DoctorFavouriteMedicine";
  externalId: string | null;
  id: string | null;
  medicineConsumptionDuration: string | null;
  medicineConsumptionDurationInDays: string | null;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null;
  medicineDosage: string | null;
  medicineFormTypes: MEDICINE_FORM_TYPES | null;
  medicineFrequency: MEDICINE_FREQUENCY | null;
  medicineInstructions: string | null;
  medicineName: string | null;
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null;
  medicineToBeTaken: (MEDICINE_TO_BE_TAKEN | null)[] | null;
  medicineUnit: MEDICINE_UNIT | null;
  routeOfAdministration: ROUTE_OF_ADMINISTRATION | null;
  medicineCustomDosage: string | null;
  medicineCustomDetails: string | null;
  includeGenericNameInPrescription: boolean | null;
  genericName: string | null;
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
