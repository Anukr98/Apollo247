import gql from 'graphql-tag';
import { ApiConstants } from 'ApiConstants';
import { EmailMessage } from 'types/notificationMessageTypes';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { from } from 'apollo-link';

export const emailTypeDefs = gql`
  extend type Query {
    sendEmailMessage: String
  }
`;

export async function sendMail(emailContent: EmailMessage) {
  let ccEmailList = [];
  ccEmailList = emailContent.ccEmail.split(',');
  const sendgrid = require('sendgrid')(
    process.env.SENDGRID_USER_NAME,
    process.env.SENDGRID_PASSWORD
  );
  const email = new sendgrid.Email({
    to: 'pratysh.s@apollo247.org',
    cc: ccEmailList,
    from: emailContent.fromEmail,
    fromname: emailContent.fromName,
    subject: emailContent.subject,
    text: emailContent.messageContent,
    html: emailContent.messageContent,
  });
  sendgrid.send(email, function(err: any, json: any) {
    if (err) {
      return console.error(err);
    }
    return json;
  });
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
