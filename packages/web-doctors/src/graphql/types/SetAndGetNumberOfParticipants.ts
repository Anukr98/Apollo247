/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { USER_TYPE, BOOKINGSOURCE, DEVICETYPE, USER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: SetAndGetNumberOfParticipants
// ====================================================

export interface SetAndGetNumberOfParticipants_setAndGetNumberOfParticipants {
  __typename: "setAndGetNumberOfParticipantsResult";
  NUMBER_OF_PARTIPANTS: number | null;
}

export interface SetAndGetNumberOfParticipants {
  setAndGetNumberOfParticipants: SetAndGetNumberOfParticipants_setAndGetNumberOfParticipants | null;
}

export interface SetAndGetNumberOfParticipantsVariables {
  appointmentId?: string | null;
  userType?: USER_TYPE | null;
  sourceType?: BOOKINGSOURCE | null;
  deviceType?: DEVICETYPE | null;
  userStatus?: USER_STATUS | null;
}
