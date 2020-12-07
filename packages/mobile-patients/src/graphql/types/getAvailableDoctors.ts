/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChooseDoctorInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: getAvailableDoctors
// ====================================================

export interface getAvailableDoctors_getAvailableDoctors_availalbeDoctors {
  __typename: "AvailableDoctor";
  doctorId: string;
  doctorPhoto: string;
  doctorLastName: string;
  doctorFirstName: string;
  availableSlot: any;
  specialityName: string;
  experience: number;
}

export interface getAvailableDoctors_getAvailableDoctors {
  __typename: "ChooseDoctorResult";
  availalbeDoctors: (getAvailableDoctors_getAvailableDoctors_availalbeDoctors | null)[] | null;
}

export interface getAvailableDoctors {
  getAvailableDoctors: getAvailableDoctors_getAvailableDoctors;
}

export interface getAvailableDoctorsVariables {
  ChooseDoctorInput: ChooseDoctorInput;
}
