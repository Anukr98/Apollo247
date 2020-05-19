import AbortController from 'abort-controller';
import { PrismGetAuthTokenResponse, PrismGetUsersResponse } from 'types/prism';
import { ServiceBusService } from 'azure-sb';
import { Patient } from 'profiles-service/entities';
import { log } from 'customWinstonLogger';

const prismTimeoutMillSeconds = process.env.PRISM_TIMEOUT_IN_MILLISECONDS
  ? Number(process.env.PRISM_TIMEOUT_IN_MILLISECONDS)
  : 3000;
const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, prismTimeoutMillSeconds); //TODO: change this to env variable

const prismHost = process.env.PRISM_HOST ? process.env.PRISM_HOST : '';

export async function prismAuthenticationAsync(
  mobileNumber: string
): Promise<PrismGetAuthTokenResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
    signal: controller.signal,
  };
  const apiUrl = `${process.env.PRISM_GET_AUTH_TOKEN_API}?mobile=${mobileNumber}`;

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
    'registerPatients-prismAuthenticationAsync()->API_CALL_STARTING',
    '',
    ''
  );
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        log(
          'profileServiceLogger',
          `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
          'registerPatients-prismAuthenticationAsync()->RECIEVED_DATA',
          '',
          JSON.stringify(data)
        );
      },
      (err) => {
        log(
          'profileServiceLogger',
          `API_CALL_ERROR: ${apiUrl}`,
          'registerPatients-prismAuthenticationAsync()->ERROR',
          '',
          JSON.stringify(err)
        );
        if (err.name === 'AbortError') {
          return { response: 'AbortError' };
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

export async function prismGetUsersAsync(
  mobileNumber: string,
  authToken: string
): Promise<PrismGetUsersResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
    signal: controller.signal,
  };
  const apiUrl = `${process.env.PRISM_GET_USERS_API}?authToken=${authToken}&mobile=${mobileNumber}`;

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
    'registerPatients-prismGetUsersAsync()->API_CALL_STARTING',
    '',
    ''
  );
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        log(
          'profileServiceLogger',
          `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
          'registerPatients-prismGetUsersAsync()->RECIEVED_DATA',
          '',
          JSON.stringify(data)
        );
      },
      (err) => {
        log(
          'profileServiceLogger',
          `API_CALL_ERROR: ${apiUrl}`,
          'registerPatients-prismGetUsersAsync()->ERROR',
          '',
          JSON.stringify(err)
        );
        if (err.name === 'AbortError') {
          return { response: { recoveryMessage: 'AbortError' } };
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

export async function prismAuthentication(
  mobileNumber: string
): Promise<PrismGetAuthTokenResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
  };
  const apiUrl = `${process.env.PRISM_GET_AUTH_TOKEN_API}?mobile=${mobileNumber}`;

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
    'registerPatients-prismAuthentication()->API_CALL_STARTING',
    '',
    ''
  );
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        log(
          'profileServiceLogger',
          `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
          'registerPatients-prismAuthentication()->RECIEVED_DATA',
          '',
          JSON.stringify(data)
        );
      },
      (err) => {
        log(
          'profileServiceLogger',
          `API_CALL_ERROR: ${apiUrl}`,
          'registerPatients-prismAuthentication()->ERROR',
          '',
          JSON.stringify(err)
        );
      }
    );
}

export async function prismGetUsers(
  mobileNumber: string,
  authToken: string
): Promise<PrismGetUsersResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
  };

  const apiUrl = `${process.env.PRISM_GET_USERS_API}?authToken=${authToken}&mobile=${mobileNumber}`;

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
    'registerPatients-prismGetUser()->API_CALL_STARTING',
    '',
    ''
  );
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        log(
          'profileServiceLogger',
          `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
          'registerPatients-prismGetUsers()->RECIEVED_DATA',
          '',
          JSON.stringify(data)
        );
      },
      (err) => {
        log(
          'profileServiceLogger',
          `API_CALL_ERROR: ${apiUrl}`,
          'registerPatients-prismGetUsersAsync()->ERROR',
          '',
          JSON.stringify(err)
        );
      }
    );
}

export async function addToPatientPrismQueue(patientDetails: Patient) {
  log(
    'profileServiceLogger',
    `addedToPatientPrismQueue`,
    'addedToPatientPrismQueue',
    '',
    JSON.stringify(patientDetails)
  );
  const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  const azureServiceBus = new ServiceBusService(serviceBusConnectionString);
  const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME_PATIENTS
    ? process.env.AZURE_SERVICE_BUS_QUEUE_NAME_PATIENTS
    : '';
  azureServiceBus.createTopicIfNotExists(queueName, (topicError) => {
    if (topicError) {
      log(
        'profileServiceLogger',
        `topicError: ${JSON.stringify(topicError)}`,
        'topic create error',
        '',
        JSON.stringify(patientDetails)
      );
    }

    log(
      'profileServiceLogger',
      `connected to topic: ${JSON.stringify(queueName)}`,
      'topic create error',
      '',
      JSON.stringify(patientDetails)
    );
    const message = 'PRISM_USER_DETAILS:' + patientDetails.mobileNumber;
    azureServiceBus.sendTopicMessage(queueName, message, (sendMsgError) => {
      if (sendMsgError) {
        log(
          'profileServiceLogger',
          `sendMsgError: ${JSON.stringify(sendMsgError)}`,
          'send Azure Bus message errorr',
          '',
          JSON.stringify(patientDetails)
        );
      }
      console.log('message sent to topic');
      log(
        'profileServiceLogger',
        `message sent to topic`,
        'message sent to topic',
        '',
        JSON.stringify(patientDetails)
      );
    });
  });
}

//common function to check or insert patient
export async function findOrCreatePatient(
  findOptions: { uhid?: Patient['uhid']; mobileNumber: Patient['mobileNumber']; isActive: true },
  createOptions: Partial<Patient>
): Promise<Patient> {
  const existingPatient = await Patient.findOne({
    where: { uhid: findOptions.uhid, mobileNumber: findOptions.mobileNumber, isActive: true },
  });
  return existingPatient || Patient.create(createOptions).save();
}
//end common function

export async function prismGetUserDetails(
  uhid: string,
  authToken: string
): Promise<PrismGetUsersResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
  };

  const apiUrl = `${process.env.PRISM_GET_USER_DETAILS_API}?authToken=${authToken}&uhid=${uhid}`;

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
    'getPrismUsersDetails-prismGetUserDetails()->API_CALL_STARTING',
    '',
    ''
  );
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        log(
          'profileServiceLogger',
          `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
          'getPrismUsersDetails-prismGetUserDetails()->RECIEVED_DATA',
          '',
          JSON.stringify(data)
        );
      },
      (err) => {
        log(
          'profileServiceLogger',
          `API_CALL_ERROR: ${apiUrl}`,
          'registerPatients-prismGetUserDetails()->ERROR',
          '',
          JSON.stringify(err)
        );
      }
    );
}

export async function linkUhid(
  primaryuhid: string,
  authToken: string,
  uhids: string //coma seperated uhids
): Promise<PrismGetUsersResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
  };

  const apiUrl = `${process.env.PRISM_LINK_UHID_API}?authToken=${authToken}&primaryuhid=${primaryuhid}&uhids=${uhids}`;

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
    'getPrismUsersDetails-linkUhid()->API_CALL_STARTING',
    '',
    ''
  );
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        log(
          'profileServiceLogger',
          `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
          'getPrismUsersDetails-linkUhid()->RECIEVED_DATA',
          '',
          JSON.stringify(data)
        );
      },
      (err) => {
        log(
          'profileServiceLogger',
          `API_CALL_ERROR: ${apiUrl}`,
          'registerPatients-linkUhid()->ERROR',
          '',
          JSON.stringify(err)
        );
      }
    );
}

export async function delinkUhid(
  primaryuhid: string,
  authToken: string,
  uhids: string //coma seperated uhids
): Promise<PrismGetUsersResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
  };

  const apiUrl = `${process.env.PRISM_DELINK_UHID_API}?authToken=${authToken}&primaryuhid=${primaryuhid}&uhids=${uhids}`;

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
    'getPrismUsersDetails-linkUhid()->API_CALL_STARTING',
    '',
    ''
  );
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        log(
          'profileServiceLogger',
          `EXTERNAL_API_CALL_PRISM: ${apiUrl}`,
          'getPrismUsersDetails-delinkuhids()->RECIEVED_DATA',
          '',
          JSON.stringify(data)
        );
      },
      (err) => {
        log(
          'profileServiceLogger',
          `API_CALL_ERROR: ${apiUrl}`,
          'registerPatients-delinkuhids()->ERROR',
          '',
          JSON.stringify(err)
        );
      }
    );
}
