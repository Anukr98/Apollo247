import gql from 'graphql-tag';
import { EmailMessage } from 'types/notificationMessageTypes';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { log } from 'customWinstonLogger';

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
  const emailOptions = {
    to: emailContent.toEmail,
    cc: ccEmailList,
    from: emailContent.fromEmail,
    fromname: emailContent.fromName,
    subject: emailContent.subject,
    text: emailContent.messageContent,
    html: emailContent.messageContent,
    attachments: emailContent.attachments,
  };
  log(
    'notificationServiceLogger',
    `SENDING_EMAIL_TO_${emailContent.toEmail}`,
    ``,
    JSON.stringify(emailOptions),
    ''
  );
  try {
    const sendgridResp = await sendgrid.send(emailOptions);
    log(
      'notificationServiceLogger',
      `SEND_EMAIL_TO_${emailContent.toEmail}_RESPONSE`,
      ``,
      JSON.stringify(sendgridResp),
      ''
    );
  } catch (error) {
    log(
      'notificationServiceLogger',
      `SEND_EMAIL_TO_${emailContent.toEmail}_FAILED`,
      ``,
      JSON.stringify(error),
      ''
    );
  }
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
