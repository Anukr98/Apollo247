import gql from 'graphql-tag';
import { ApiConstants } from 'ApiConstants';
import { EmailMessage } from 'types/notificationMessageTypes';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';

export const emailTypeDefs = gql`
  extend type Query {
    sendEmailMessage: String
  }
`;

export async function sendMail(emailContent: EmailMessage) {
  const lib = require('pepipost');
  const controller = lib.EmailController;
  const apiKey = ApiConstants.PEPIPOST_API_KEY;
  const body = new lib.EmailBody();
  body.personalizations = [];
  body.personalizations[0] = new lib.Personalizations();
  body.personalizations[0].recipient = emailContent.toEmail;
  body.from = new lib.From();
  body.from.fromEmail = emailContent.fromEmail;
  body.from.fromName = emailContent.fromName;
  body.subject = emailContent.subject;
  body.content = emailContent.messageContent;
  const mailStatus = await controller.createSendEmail(apiKey, body);
  return mailStatus;
}

const sendEmailMessage: Resolver<null, {}, NotificationsServiceContext, string> = async (
  parent,
  {},
  {}
) => {
  return '';
};

export const emailResolvers = {
  Query: {
    sendEmailMessage,
  },
};
