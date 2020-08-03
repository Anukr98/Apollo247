import AbortController from 'abort-controller';
import { debugLog } from 'customWinstonLogger';
import fetch from 'node-fetch';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes } from 'date-fns';

const webEngageTimeoutMillSeconds = Number(process.env.WEBENGAGE_TIMEOUT_IN_MILLISECONDS);

const dLogger = debugLog(
  'profileServiceLogger',
  'webEngage',
  Math.floor(Math.random() * 100000000)
);

export interface WebEngageResponse {
  response: {
    status: 'queued';
  };
}

export interface WebEngageInput {
  userId: string;
  eventName: string;
  eventTime: string;
  eventData: Partial<WebEngageEventData>;
}

export interface WebEngageEventData {
  orderId: number;
  orderType: string;
  statusDateTime: string;
  orderAmount: string;
  orderTAT: string;
  billedAmount: string;
  DSP: string;
  AWBNumber: string;
  reasonCode: string;
  consultID: string;
  displayID: string;
  consultMode: string;
  doctorName: string;
}

export enum WebEngageEvent {
  DOCTOR_IN_CHAT_WINDOW = 'DOCTOR_IN_CHAT_WINDOW',
  DOCTOR_LEFT_CHAT_WINDOW = 'DOCTOR_LEFT_CHAT_WINDOW',
  DOCTOR_SENT_MESSAGE = 'DOCTOR_SENT_MESSAGE',
}

export async function postEvent(uploadParams: Partial<WebEngageInput>): Promise<WebEngageResponse> {
  if (
    !process.env.WEB_ENGAGE_URL_API ||
    !process.env.WEB_ENGAGE_API_KEY ||
    !process.env.WEB_ENGAGE_LICENSE_CODE
  )
    throw new AphError(AphErrorMessages.INVALID_WEBENGAGE_URL);

  let apiUrl = process.env.WEB_ENGAGE_URL_API.toString();
  apiUrl = apiUrl.replace('{LICENSE_CODE}', process.env.WEB_ENGAGE_LICENSE_CODE);

  uploadParams.eventTime = format(addMinutes(new Date(), +330), "yyyy-MM-dd'T'HH:mm:ss'+0530'");

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, webEngageTimeoutMillSeconds);
  return await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.WEB_ENGAGE_API_KEY,
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
    body: JSON.stringify(uploadParams),
  })
    .then((res) => res.json())
    .then(
      (data) => {
        console.log(data);
        dLogger(
          reqStartTime,
          'postWebEngageEvent POST_WEBENGAGE_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(data)}`
        );
        return data;
      },
      (err) => {
        console.log(err);
        dLogger(
          reqStartTime,
          'postWebEngageEvent POST_WEBENGAGE_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_WEBENGAGE);
        } else {
          throw new AphError(AphErrorMessages.ERROR_FROM_WEBENGAGE);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}
