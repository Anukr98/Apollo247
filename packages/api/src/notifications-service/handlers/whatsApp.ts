import { isNotificationAllowed } from 'notifications-service/handlers/common';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs';
import { ApiConstants } from 'ApiConstants';
import fetch from 'node-fetch';
import { log } from 'customWinstonLogger';

export const sendNotificationWhatsapp = async (
  mobileNumber: string,
  message: string,
  loginType: number
) => {
  /*const apiUrl =
      process.env.WHATSAPP_URL +
      '?method=OPT_IN&phone_number=' +
      mobileNumber +
      '&userid=' +
      process.env.WHATSAPP_USERNAME +
      '&password=' +
      process.env.WHATSAPP_PASSWORD +
      '&auth_scheme=plain&format=text&v=1.1&channel=WHATSAPP';
    const whatsAppResponse = await fetch(apiUrl)
      .then(async (res) => {
        if (loginType == 1) {
          const sendApiUrl = `${process.env.WHATSAPP_URL}?method=SendMessage&send_to=${mobileNumber}&userid=${process.env.WHATSAPP_USERNAME}&password=${process.env.WHATSAPP_PASSWORD}&auth_scheme=plain&msg_type=TEXT&format=text&v=1.1&msg=${message}`;
          fetch(sendApiUrl)
            .then((res) => res)
            .catch((error) => {
              console.log('whatsapp error', error);
              throw new AphError(AphErrorMessages.MESSAGE_SEND_WHATSAPP_ERROR);
            });
        }
      })
      .catch((error) => {
        throw new AphError(AphErrorMessages.GET_OTP_ERROR);
      });
    return whatsAppResponse;*/
  return true;
};

export const sendDoctorNotificationWhatsapp = async (
  templateName: string,
  phoneNumber: string,
  templateData: string[]
) => {
  const fileName = process.env.NODE_ENV + '_whatsapp_' + format(new Date(), 'yyyyMMdd') + '.txt';
  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const content =
    phoneNumber +
    templateData +
    '\n------------------------------------------------------------------------------------\n';
  fs.appendFile(assetsDir + '/' + fileName, content, (err) => {});
  const isWhitelisted = await isNotificationAllowed(phoneNumber);
  if (!isWhitelisted) {
    return;
  }

  let scenarioKey = '';

  if (!process.env.WHATSAPP_SCENARIO_KEY || process.env.WHATSAPP_SCENARIO_KEY == '') {
    let content =
      format(new Date(), 'yyyy-MM-dd hh:mm') + '\n ' + phoneNumber + ' - ' + templateName;
    content +=
      'Scenario key undefined \n------------------------------------------------------------------------------------\n';
    fs.appendFile(assetsDir + '/' + fileName, content, (err) => {});
    log(
      'notificationServiceLogger',
      content,
      `without WHATSAPP_SCENARIO_KEY ${templateName}`,
      '',
      ''
    );
  } else {
    scenarioKey = process.env.WHATSAPP_SCENARIO_KEY;
    const url = process.env.WHATSAPP_SEND_URL ? process.env.WHATSAPP_SEND_URL : '';
    if (templateName == ApiConstants.WHATSAPP_DOC_SUMMARY_NEW) {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          scenarioKey,
          destinations: [{ to: { phoneNumber } }],
          whatsApp: {
            templateName,
            mediaTemplateData: {
              header: {
                documentUrl: templateData[0],
                documentFilename: templateData[1],
              },
              body: {
                placeholders: [templateData[4], templateData[2], templateData[5], templateData[3]],
              },
            },
            language: 'en',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.WHATSAPP_AUTH_HEADER ? process.env.WHATSAPP_AUTH_HEADER : '',
        },
      });
      let content =
        format(new Date(), 'yyyy-MM-dd hh:mm') +
        '\n ' +
        templateData[0] +
        '-' +
        phoneNumber +
        ' - ' +
        templateName +
        ' - ' +
        process.env.WHATSAPP_DOCTOR_NUMBER +
        ' - ' +
        process.env.WHATSAPP_AUTH_HEADER +
        ' - ' +
        scenarioKey +
        ' - ' +
        response.status;
      content +=
        '\n------------------------------------------------------------------------------------\n';
      fs.appendFile(assetsDir + '/' + fileName, content, (err) => {});
      log(
        'notificationServiceLogger',
        content,
        `with WHATSAPP_SCENARIO_KEY ${templateName}---Response - ${response}`,
        '',
        ''
      );
      console.log(JSON.stringify(response, null, 1), 'response');
    } else {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          scenarioKey,
          destinations: [{ to: { phoneNumber } }],
          whatsApp: {
            templateName,
            templateData,
            language: 'en',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.WHATSAPP_AUTH_HEADER ? process.env.WHATSAPP_AUTH_HEADER : '',
        },
      });
      let content =
        format(new Date(), 'yyyy-MM-dd hh:mm') +
        '\n ' +
        phoneNumber +
        ' - ' +
        templateName +
        ' - ' +
        process.env.WHATSAPP_DOCTOR_NUMBER +
        ' - ' +
        process.env.WHATSAPP_AUTH_HEADER +
        ' - ' +
        scenarioKey +
        ' - ' +
        response.status;
      content +=
        '\n------------------------------------------------------------------------------------\n';
      fs.appendFile(assetsDir + '/' + fileName, content, (err) => {});
      console.log(JSON.stringify(response, null, 1), 'response');
      log(
        'notificationServiceLogger',
        content,
        `with WHATSAPP_SCENARIO_KEY ${templateName}---Response - ${response}`,
        '',
        ''
      );
    }
  }
};
