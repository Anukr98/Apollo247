/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { HelpEmailInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TicketNumberMutation
// ====================================================

export interface TicketNumberMutation_createHelpTicket_ticket_customFields {
  __typename: "ZohoCustomField";
  Business: string | null;
}

export interface TicketNumberMutation_createHelpTicket_ticket {
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
  customFields: TicketNumberMutation_createHelpTicket_ticket_customFields | null;
}

export interface TicketNumberMutation_createHelpTicket {
  __typename: "CreateHelpdeskTicketResult";
  ticket: TicketNumberMutation_createHelpTicket_ticket | null;
}

export interface TicketNumberMutation {
  createHelpTicket: TicketNumberMutation_createHelpTicket | null;
}

export interface TicketNumberMutationVariables {
  createHelpTicketHelpEmailInput?: HelpEmailInput | null;
}
