/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ErrorMsgs {
  INVALID_MOBILE_NUMBER = 'INVALID_MOBILE_NUMBER',
  INVALID_TOKEN = 'INVALID_TOKEN',
  PRISM_AUTH_TOKEN_ERROR = 'PRISM_AUTH_TOKEN_ERROR',
  PRISM_GET_USERS_ERROR = 'PRISM_GET_USERS_ERROR',
  PRISM_NO_DATA = 'PRISM_NO_DATA',
  UPDATE_PROFILE_ERROR = 'UPDATE_PROFILE_ERROR',
}

export enum Relation {
  BROTHER = 'BROTHER',
  COUSIN = 'COUSIN',
  FATHER = 'FATHER',
  HUSBAND = 'HUSBAND',
  ME = 'ME',
  MOTHER = 'MOTHER',
  OTHER = 'OTHER',
  SISTER = 'SISTER',
  WIFE = 'WIFE',
}

export enum Sex {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  NOT_KNOWN = 'NOT_KNOWN',
  OTHER = 'OTHER',
}

export interface UpdatePatientInput {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  mobileNumber?: string | null;
  sex?: Sex | null;
  uhid?: string | null;
  emailAddress?: string | null;
  dateOfBirth?: string | null;
  relation?: Relation | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
