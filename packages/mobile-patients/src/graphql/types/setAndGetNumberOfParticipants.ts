/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { USER_TYPE, BOOKINGSOURCE, DEVICETYPE, USER_STATUS } from "./globalTypes";

// ====================================================
// GraphQL query operation: setAndGetNumberOfParticipants
// ====================================================

export interface setAndGetNumberOfParticipants_setAndGetNumberOfParticipants {
  __typename: "setAndGetNumberOfParticipantsResult";
  NUMBER_OF_PARTIPANTS: number | null;
}

export interface setAndGetNumberOfParticipants {
  setAndGetNumberOfParticipants: setAndGetNumberOfParticipants_setAndGetNumberOfParticipants | null;
}

export interface setAndGetNumberOfParticipantsVariables {
  appointmentId?: string | null;
  userType?: USER_TYPE | null;
  sourceType?: BOOKINGSOURCE | null;
  deviceType?: DEVICETYPE | null;
  userStatus?: USER_STATUS | null;
}
