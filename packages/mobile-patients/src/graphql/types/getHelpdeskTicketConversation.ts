/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getHelpdeskTicketConversation
// ====================================================

export interface getHelpdeskTicketConversation_getHelpdeskTicketConversation_conversations {
  __typename: "TicketConsversationsType";
  id: string | null;
  type: string | null;
  contentType: string | null;
  comment: string | null;
  commenterName: string | null;
  commenterType: string | null;
  createdTime: string | null;
}

export interface getHelpdeskTicketConversation_getHelpdeskTicketConversation {
  __typename: "GetHelpdeskTicketConversationResult";
  conversations: (getHelpdeskTicketConversation_getHelpdeskTicketConversation_conversations | null)[] | null;
}

export interface getHelpdeskTicketConversation {
  getHelpdeskTicketConversation: getHelpdeskTicketConversation_getHelpdeskTicketConversation | null;
}

export interface getHelpdeskTicketConversationVariables {
  ticketId: string;
}
