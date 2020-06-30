import gql from 'graphql-tag';
import { EmailMessage } from 'types/notificationMessageTypes';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';

export const emailTypeDefs = gql`
  extend type Query {
    sendEmailMessage: String
  }
`;

export async function sendMail(emailContent: EmailMessage) {
  let ccEmailList = [];
  ccEmailList = emailContent.ccEmail.split(',');
  const sendgrid = require('@sendgrid/mail');
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  sendgrid.send(
    {
      to: emailContent.toEmail,
      cc: ccEmailList,
      from: emailContent.fromEmail,
      fromname: emailContent.fromName,
      subject: emailContent.subject,
      text: emailContent.messageContent,
      html: emailContent.messageContent,
      attachments: emailContent.attachments,
    }, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err: any, json: any) => {
      if (err) {
        return console.error(err);
      }
      const statusCode: { status: string } = { status: json.request.statusCode };
      return statusCode;
    }
  );
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
