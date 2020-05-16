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
  let ccEmailList = [];
  ccEmailList = emailContent.ccEmail.split(',');
  var sendgrid = require('@sendgrid/mail');
  sendgrid.setApiKey(ApiConstants.SENDGRID_API_KEY);
  sendgrid.send(
    {
      to: emailContent.toEmail,
      cc: ccEmailList,
      from: emailContent.fromEmail,
      fromname: emailContent.fromName,
      subject: emailContent.subject,
      text: emailContent.messageContent,
      html: emailContent.messageContent,
    },
    function(err: any, json: any) {
      if (err) {
        return console.error(err);
      }
      let statusCode: { status: string } = { status: json.request.statusCode };
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
