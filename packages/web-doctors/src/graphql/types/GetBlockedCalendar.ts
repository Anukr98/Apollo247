/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetBlockedCalendar
// ====================================================

export interface GetBlockedCalendar_getBlockedCalendar_blockedCalendar {
  __typename: "BlockedCalendarItem";
  id: number;
  doctorId: string;
  start: any;
  end: any;
}

export interface GetBlockedCalendar_getBlockedCalendar {
  __typename: "BlockedCalendarResult";
  blockedCalendar: GetBlockedCalendar_getBlockedCalendar_blockedCalendar[];
}

export interface GetBlockedCalendar {
  getBlockedCalendar: GetBlockedCalendar_getBlockedCalendar;
}

export interface GetBlockedCalendarVariables {
  doctorId: string;
}
