import AbortController from 'abort-controller';
import { PrismGetAuthTokenResponse, PrismGetUsersResponse } from 'types/prism';
import { ServiceBusService } from 'azure-sb';
import { Patient } from 'profiles-service/entities';
import { debugLog } from 'customWinstonLogger';

const prismTimeoutMillSeconds = process.env.PRISM_TIMEOUT_IN_MILLISECONDS
  ? Number(process.env.PRISM_TIMEOUT_IN_MILLISECONDS)
  : 3000;
const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, prismTimeoutMillSeconds); //TODO: change this to env variable

const prismHost = process.env.PRISM_HOST ? process.env.PRISM_HOST : '';
// Curried method with static parameters being passed.
const dLogger = debugLog(
  'profileServiceLogger',
  'prismCall',
  Math.floor(Math.random() * 100000000)
);

export async function prismAuthenticationAsync(
  mobileNumber: string
): Promise<PrismGetAuthTokenResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
    signal: controller.signal,
  };
  const apiUrl = `${process.env.PRISM_GET_AUTH_TOKEN_API}?mobile=${mobileNumber}`;

  const time = new Date();
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          time,
          'prismAuthenticationAsync PRISM_GET_AUTHTOKEN_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        return data;
      },
      (err) => {
        dLogger(
          time,
          'prismAuthenticationAsync PRISM_GET_AUTHTOKEN_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
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

  const time = new Date();
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          time,
          'prismGetUsersAsync PRISM_GET_USERS_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        return data;
      },
      (err) => {
        dLogger(
          time,
          'prismGetUsersAsync PRISM_GET_USERS_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
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

  const time = new Date();
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          time,
          'prismAuthentication PRISM_GET_AUTHTOKEN_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        return data;
      },
      (err) => {
        dLogger(
          time,
          'prismAuthentication PRISM_GET_AUTHTOKEN_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
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

  const time = new Date();
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          time,
          'prismGetUsers PRISM_GET_USERS_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        return data;
      },
      (err) => {
        dLogger(
          time,
          'prismGetUsers PRISM_GET_USERS_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
        );
      }
    );
}

export async function addToPatientPrismQueue(patientDetails: Patient) {
  const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  const azureServiceBus = new ServiceBusService(serviceBusConnectionString);
  const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME_PATIENTS
    ? process.env.AZURE_SERVICE_BUS_QUEUE_NAME_PATIENTS
    : '';
  let time = new Date();
  azureServiceBus.createTopicIfNotExists(queueName, (topicError) => {
    if (topicError) {
      dLogger(
        time,
        'addToPatientPrismQueue azureServiceBus.createTopicIfNotExists ERROR',
        `${JSON.stringify(patientDetails)} --- ${JSON.stringify(topicError)}`
      );
    }
    dLogger(
      time,
      'addToPatientPrismQueue azureServiceBus.createTopicIfNotExists END',
      `${JSON.stringify(patientDetails)} --- ${JSON.stringify(queueName)}`
    );

    time = new Date();
    const message = 'PRISM_USER_DETAILS:' + patientDetails.mobileNumber;
    azureServiceBus.sendTopicMessage(queueName, message, (sendMsgError) => {
      if (sendMsgError) {
        dLogger(
          time,
          'addToPatientPrismQueue azureServiceBus.sendTopicMessage ERROR',
          `${JSON.stringify(queueName)} --- ${message} --- ${JSON.stringify(sendMsgError)}`
        );
      }
      dLogger(
        time,
        'addToPatientPrismQueue azureServiceBus.sendTopicMessage END',
        `${JSON.stringify(queueName)} --- ${message}`
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

  const time = new Date();
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          time,
          'prismGetUserDetails PRISM_GET_USER_DETAILS_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        return data;
      },
      (err) => {
        dLogger(
          time,
          'prismGetUserDetails PRISM_GET_USER_DETAILS_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
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

  const time = new Date();
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          time,
          'linkUhid PRISM_LINK_UHID_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        return data;
      },
      (err) => {
        dLogger(
          time,
          'linkUhid PRISM_LINK_UHID_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
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

  const time = new Date();
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          time,
          'delinkuhids PRISM_DELINK_UHID_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        return data;
      },
      (err) => {
        dLogger(
          time,
          'delinkuhids PRISM_DELINK_UHID_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
        );
      }
    );
}
