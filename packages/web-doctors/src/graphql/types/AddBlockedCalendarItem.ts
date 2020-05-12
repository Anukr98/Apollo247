/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddBlockedCalendarItem
// ====================================================

export interface AddBlockedCalendarItem_addBlockedCalendarItem_blockedCalendar {
  __typename: "BlockedCalendarItem";
  id: number;
  doctorId: string;
  start: any;
  end: any;
}

export interface AddBlockedCalendarItem_addBlockedCalendarItem {
  __typename: "BlockedCalendarResult";
  blockedCalendar: AddBlockedCalendarItem_addBlockedCalendarItem_blockedCalendar[];
}

export interface AddBlockedCalendarItem {
  addBlockedCalendarItem: AddBlockedCalendarItem_addBlockedCalendarItem;
}

export interface AddBlockedCalendarItemVariables {
  doctorId: string;
  start: any;
  end: any;
}
