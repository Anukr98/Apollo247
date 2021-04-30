/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getHelpdeskTickets
// ====================================================

export interface getHelpdeskTickets_getHelpdeskTickets_tickets_customFields {
  __typename: "ZohoCustomField";
  Business: string | null;
}

export interface getHelpdeskTickets_getHelpdeskTickets_tickets {
  __typename: "HelpdeskTicket";
  statusType: string | null;
  subject: string | null;
  createdTime: string | null;
  ticketNumber: string | null;
  modifiedTime: string | null;
  channel: string | null;
  closedTime: string | null;
  id: string | null;
  status: string | null;
  customFields: getHelpdeskTickets_getHelpdeskTickets_tickets_customFields | null;
}

export interface getHelpdeskTickets_getHelpdeskTickets {
  __typename: "HelpdeskTicketResult";
  tickets: (getHelpdeskTickets_getHelpdeskTickets_tickets | null)[] | null;
  count: number | null;
}

export interface getHelpdeskTickets {
  getHelpdeskTickets: getHelpdeskTickets_getHelpdeskTickets | null;
}
