/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockMultipleItems } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockMultipleCalendarItems
// ====================================================

export interface BlockMultipleCalendarItems_blockMultipleCalendarItems_blockedCalendar {
  __typename: "BlockedCalendarItem";
  id: number;
  doctorId: string;
  start: any;
  end: any;
}

export interface BlockMultipleCalendarItems_blockMultipleCalendarItems {
  __typename: "BlockedCalendarResult";
  blockedCalendar: BlockMultipleCalendarItems_blockMultipleCalendarItems_blockedCalendar[];
}

export interface BlockMultipleCalendarItems {
  blockMultipleCalendarItems: BlockMultipleCalendarItems_blockMultipleCalendarItems;
}

export interface BlockMultipleCalendarItemsVariables {
  blockCalendarInputs: BlockMultipleItems;
}
