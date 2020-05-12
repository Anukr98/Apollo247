/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateBlockedCalendarItem
// ====================================================

export interface UpdateBlockedCalendarItem_updateBlockedCalendarItem_blockedCalendar {
  __typename: "BlockedCalendarItem";
  id: number;
  doctorId: string;
  start: any;
  end: any;
}

export interface UpdateBlockedCalendarItem_updateBlockedCalendarItem {
  __typename: "BlockedCalendarResult";
  blockedCalendar: UpdateBlockedCalendarItem_updateBlockedCalendarItem_blockedCalendar[];
}

export interface UpdateBlockedCalendarItem {
  updateBlockedCalendarItem: UpdateBlockedCalendarItem_updateBlockedCalendarItem;
}

export interface UpdateBlockedCalendarItemVariables {
  id: number;
  doctorId: string;
  start: any;
  end: any;
}
