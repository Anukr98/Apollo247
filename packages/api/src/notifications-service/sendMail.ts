import { AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
//import lib from 'pepipost';
import { AppointmentPayload } from 'types/appointmentTypes';

type TestMessage = AphMqMessage<AphMqMessageTypes.BOOKAPPOINTMENT, AppointmentPayload>;
export const SendMail = {
  send: async function(message: TestMessage) {
    const lib = require('pepipost');
    //const configuration = lib.Configuration;
    const controller = lib.EmailController;
    const apiKey = '0e396e4e9b5247d267c9a536cd154869';
    const mailContent =
      'Hi ' +
      message.payload.userFirstName +
      ', your appointment with doctor ' +
      message.payload.doctorName +
      ' is confirmed on ' +
      message.payload.appointmentDate +
      ' at ' +
      message.payload.slotTime;
    const body = new lib.EmailBody();

    body.personalizations = [];
    body.personalizations[0] = new lib.Personalizations();
    body.personalizations[0].recipient = 'sriram.kanchan@popcornapps.com';
    body.personalizations[0].xApiheaderCc = '123';
    body.personalizations[0].xApiheader = '12';
    body.personalizations[0].attributes = JSON.parse('{"name":"Ravi"}');
    body.personalizations[0].attachments = [];

    //body.personalizations[0].attachments[0] = new lib.Attachments();
    //body.personalizations[0].attachments[0].fileContent ='SGVsbG8gRm9sa3MsIFRoaXMgaXMgUGVwaXBvc3QncyBub2RlSlMgU0RL'; //base64encoded value to be passed here
    //body.personalizations[0].attachments[0].fileName = '';
    body.personalizations[0].recipientCc = ['prasanth.babu@popcornapps.com'];

    body.tags = 'tagsTransnodejs';
    body.from = new lib.From();
    body.from.fromEmail = 'info@pepisandbox.com';
    body.from.fromName = 'Apollo Hospitals';
    body.subject = 'Appointment confirmation from apollo';
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
};
