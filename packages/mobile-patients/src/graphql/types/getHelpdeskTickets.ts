/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getHelpdeskTickets
// ====================================================

export interface getHelpdeskTickets_getHelpdeskTickets_tickets {
  __typename: "HelpdeskTicket";
  statusType: string | null;
  subject: string | null;
  createdTime: string | null;
  ticketNumber: string | null;
  description: string | null;
  modifiedTime: string | null;
  channel: string | null;
  closedTime: string | null;
  id: string | null;
}

export interface getHelpdeskTickets_getHelpdeskTickets {
  __typename: "HelpdeskTicketResult";
  tickets: (getHelpdeskTickets_getHelpdeskTickets_tickets | null)[] | null;
  count: number | null;
}

export interface getHelpdeskTickets {
  getHelpdeskTickets: getHelpdeskTickets_getHelpdeskTickets | null;
}
