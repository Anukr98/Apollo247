import { AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
//import lib from 'pepipost';
import { AppointmentPayload } from 'types/appointmentTypes';
import { MailMessage, SmsMessage } from 'types/notificationMessageTypes';
import fetch from 'node-fetch';

type TestMessage = AphMqMessage<AphMqMessageTypes.BOOKAPPOINTMENT, AppointmentPayload>;
export const SendNotification = {
  sendEmail: async function(message: MailMessage) {
    const lib = require('pepipost');
    //const configuration = lib.Configuration;
    const controller = lib.EmailController;
    const apiKey = '0e396e4e9b5247d267c9a536cd154869';
    const mailContent = message.mailContent;

    const body = new lib.EmailBody();

    body.personalizations = [];
    body.personalizations[0] = new lib.Personalizations();
    body.personalizations[0].recipient = message.toEmailMailId;
    body.personalizations[0].xApiheaderCc = '123';
    body.personalizations[0].xApiheader = '12';
    body.personalizations[0].attributes = JSON.parse('{"name":"Ravi"}');
    body.personanlizations[0].attachments = [];

    //body.personalizations[0].attachments[0] = new lib.Attachments();
    //body.personalizations[0].attachments[0].fileContent ='SGVsbG8gRm9sa3MsIFRoaXMgaXMgUGVwaXBvc3QncyBub2RlSlMgU0RL'; //base64encoded value to be passed here
    //body.personalizations[0].attachments[0].fileName = '';
    body.personalizations[0].recipientCc = ['prasanth.babu@popcornapps.com'];

    body.tags = 'tagsTransnodejs';
    body.from = new lib.From();
    body.from.fromEmail = 'info@pepisandbox.com';
    body.from.fromName = 'Apollo Hospitals';
    body.subject = message.subject;
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
    /*await promise.then(
      (response: string) => {
        response = '1';
      },
      (err: string) => {
        console.log(err);
      }
    );*/
    return <String>'success';
  },

  sendSMS: async function(message: SmsMessage) {
    const resp = await fetch(
      'http://bulkpush.mytoday.com/BulkSms/SingleMsgApi?feedid=370454&username=7993961498&password=popcorn123$$&To=919657585411&Text=Hellocheck'
    );
    console.log(resp, 'sms resp');
  },
};
