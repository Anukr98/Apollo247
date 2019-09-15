/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveBlockedCalendarItem
// ====================================================

export interface RemoveBlockedCalendarItem_removeBlockedCalendarItem_blockedCalendar {
  __typename: "BlockedCalendarItem";
  id: number;
  doctorId: string;
  start: any;
  end: any;
}

export interface RemoveBlockedCalendarItem_removeBlockedCalendarItem {
  __typename: "BlockedCalendarResult";
  blockedCalendar: RemoveBlockedCalendarItem_removeBlockedCalendarItem_blockedCalendar[];
}

export interface RemoveBlockedCalendarItem {
  removeBlockedCalendarItem: RemoveBlockedCalendarItem_removeBlockedCalendarItem;
}

export interface RemoveBlockedCalendarItemVariables {
  id: number;
}
