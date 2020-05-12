/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DOCTOR_ONLINE_STATUS, DoctorType, Salutation } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateDoctorOnlineStatus
// ====================================================

export interface UpdateDoctorOnlineStatus_updateDoctorOnlineStatus_doctor {
  __typename: "DoctorDetails";
  awards: string | null;
  city: string | null;
  country: string | null;
  dateOfBirth: string | null;
  doctorType: DoctorType;
  delegateNumber: string | null;
  emailAddress: string | null;
  experience: string | null;
  firebaseToken: string | null;
  displayName: string | null;
  firstName: string;
  isActive: boolean;
  id: string;
  languages: string | null;
  lastName: string;
  mobileNumber: string;
  onlineConsultationFees: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
  photoUrl: string | null;
  physicalConsultationFees: string;
  qualification: string | null;
  registrationNumber: string;
  salutation: Salutation | null;
  specialization: string | null;
  state: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  streetLine3: string | null;
  zip: string | null;
}

export interface UpdateDoctorOnlineStatus_updateDoctorOnlineStatus {
  __typename: "UpdateDoctorOnlineStatusResult";
  doctor: UpdateDoctorOnlineStatus_updateDoctorOnlineStatus_doctor;
}

export interface UpdateDoctorOnlineStatus {
  updateDoctorOnlineStatus: UpdateDoctorOnlineStatus_updateDoctorOnlineStatus;
}

export interface UpdateDoctorOnlineStatusVariables {
  doctorId: string;
  onlineStatus: DOCTOR_ONLINE_STATUS;
}
