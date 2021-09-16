/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateHelpdeskTicketInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateHelpdeskTicket
// ====================================================

export interface updateHelpdeskTicket_updateHelpdeskTicket_ticket {
  __typename: "HelpdeskTicket";
  ticketNumber: string | null;
}

export interface updateHelpdeskTicket_updateHelpdeskTicket {
  __typename: "UpdateHelpdeskTicketResult";
  ticket: updateHelpdeskTicket_updateHelpdeskTicket_ticket | null;
}

export interface updateHelpdeskTicket {
  updateHelpdeskTicket: updateHelpdeskTicket_updateHelpdeskTicket | null;
}

export interface updateHelpdeskTicketVariables {
  updateHelpdeskTicketInput: UpdateHelpdeskTicketInput;
}
