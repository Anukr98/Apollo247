/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ConsultMode {
  ONLINE = "ONLINE",
  PHYSICAL = "PHYSICAL",
}

export enum ConsultType {
  FIXED = "FIXED",
  PREFERRED = "PREFERRED",
}

export enum DoctorType {
  APOLLO = "APOLLO",
  PAYROLL = "PAYROLL",
  STAR_APOLLO = "STAR_APOLLO",
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHER = "OTHER",
}

export enum Relation {
  BROTHER = "BROTHER",
  COUSIN = "COUSIN",
  FATHER = "FATHER",
  HUSBAND = "HUSBAND",
  ME = "ME",
  MOTHER = "MOTHER",
  OTHER = "OTHER",
  SISTER = "SISTER",
  WIFE = "WIFE",
}

export enum Salutation {
  DR = "DR",
  MR = "MR",
  MRS = "MRS",
}

export enum WeekDay {
  FRIDAY = "FRIDAY",
  MONDAY = "MONDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
  THURSDAY = "THURSDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
}

export interface UpdatePatientInput {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  mobileNumber?: string | null;
  gender?: Gender | null;
  uhid?: string | null;
  emailAddress?: string | null;
  dateOfBirth?: any | null;
  relation?: Relation | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
