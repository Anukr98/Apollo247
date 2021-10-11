/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getRecentTicketQuery
// ====================================================

export interface getRecentTicketQuery_getRecentTicket_ticket_customFields {
  __typename: "ZohoCustomField";
  Business: string | null;
}

export interface getRecentTicketQuery_getRecentTicket_ticket {
  __typename: "HelpdeskTicket";
  ticketNumber: string | null;
  createdTime: string | null;
  customerResponseTime: string | null;
  modifiedTime: string | null;
  statusType: string | null;
  subject: string | null;
  channel: string | null;
  closedTime: string | null;
  description: string | null;
  id: string | null;
  status: string | null;
  customFields: getRecentTicketQuery_getRecentTicket_ticket_customFields | null;
}

export interface getRecentTicketQuery_getRecentTicket {
  __typename: "GetRecentHelpdeskTicketResult";
  ticket: getRecentTicketQuery_getRecentTicket_ticket | null;
}

export interface getRecentTicketQuery {
  getRecentTicket: getRecentTicketQuery_getRecentTicket | null;
}
