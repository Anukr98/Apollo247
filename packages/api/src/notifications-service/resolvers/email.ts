import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import _ from 'lodash';

export const emailTypeDefs = gql`
  extend type Query {
    sendEmail: String
  }
`;

export async function buildEmail() {
  const lib = require('pepipost');
  //const configuration = lib.Configuration;
  const controller = lib.EmailController;
  const apiKey = '0e396e4e9b5247d267c9a536cd154869';

  const compiled = _.template(
    '<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>'
  );
  compiled({ users: ['fred', 'barney'] });

  const mailContent = compiled;

  const body = new lib.EmailBody();

  body.personalizations = [];
  body.personalizations[0] = new lib.Personalizations();
  body.personalizations[0].recipient = 'sushma.voleti@popcornapps.com';
  // body.personalizations[0].xApiheaderCc = '123';
  //body.personalizations[0].xApiheader = '12';
  body.personalizations[0].attributes = JSON.parse('{"name":"Ravi"}');
  body.personalizations[0].attachments = [];

  body.personalizations[0].recipientCc = ['sushma.voleti@popcornapps.com'];

  body.tags = 'tagsTransnodejs';
  body.from = new lib.From();
  body.from.fromEmail = 'info@pepisandbox.com';
  body.from.fromName = 'Apollo Hospitals';
  body.subject = 'nothing';
  body.content = mailContent; //'Hello There, This is a test email from apollo Hospitals [% name %]';
  body.settings = new lib.Settings();

  body.settings.footer = 1;
  body.settings.clicktrack = 1;
  body.settings.opentrack = 1;
  body.settings.unsubscribe = 1;
  body.settings.bcc = '';
  body.replyToId = 'sriram.kanchan@popcornapps.com';

  console.log(apiKey, body);
  const promise = await controller.createSendEmail(apiKey, body);
  console.log(promise);

  return <String>'success';
}

const sendEmail: Resolver<null, {}, NotificationsServiceContext, string> = async (
  parent,
  {},
  { patientsDb, consultsDb }
) => {
  console.log(buildEmail());
  return 'fsdfsf';
};
export const emailResolvers = {
  Query: { sendEmail },
};
