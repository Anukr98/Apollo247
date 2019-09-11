import gql from 'graphql-tag';
import { ApiConstants } from 'ApiConstants';

export const emailTypeDefs = gql``;

export async function sendMail(
  messageContent: string,
  fromEmail: string,
  fromName: string,
  toEmail: string,
  subject: string
) {
  const lib = require('pepipost');
  const controller = lib.EmailController;
  const apiKey = ApiConstants.PEPIPOST_API_KEY;
  const body = new lib.EmailBody();
  body.personalizations = [];
  body.personalizations[0] = new lib.Personalizations();
  body.personalizations[0].recipient = toEmail;
  body.from = new lib.From();
  body.from.fromEmail = fromEmail;
  body.from.fromName = fromName;
  body.subject = subject;
  body.content = messageContent;
  const mailStatus = await controller.createSendEmail(apiKey, body);
  return mailStatus.message;
}

export const emailResolvers = {};
