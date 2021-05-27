/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddCommentHelpdeskTicketInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addCommentHelpdeskTicket
// ====================================================

export interface addCommentHelpdeskTicket_addCommentHelpdeskTicket {
  __typename: "AddCommentHelpdeskTicketResponse";
  status: string | null;
}

export interface addCommentHelpdeskTicket {
  addCommentHelpdeskTicket: addCommentHelpdeskTicket_addCommentHelpdeskTicket | null;
}

export interface addCommentHelpdeskTicketVariables {
  addCommentHelpdeskTicketInput: AddCommentHelpdeskTicketInput;
}
