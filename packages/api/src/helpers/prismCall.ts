import AbortController from 'abort-controller';
import { PrismGetAuthTokenResponse, PrismGetUsersResponse } from 'types/prism';
import { ServiceBusService } from 'azure-sb';
import { Patient } from 'profiles-service/entities';

const prismTimeoutMillSeconds = process.env.PRISM_TIMEOUT_IN_MILLISECONDS
  ? parseInt(process.env.PRISM_TIMEOUT_IN_MILLISECONDS)
  : 3000;
const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, prismTimeoutMillSeconds); //TODO: change this to env variable

const prismUrl = process.env.PRISM_GET_USERS_URL ? process.env.PRISM_GET_USERS_URL : '';
const prismHost = process.env.PRISM_HOST ? process.env.PRISM_HOST : '';
const prismBaseUrl = prismUrl + '/data';

export async function prismAuthenticationAsync(
  mobileNumber: string
): Promise<PrismGetAuthTokenResponse> {
  const prismHeaders = {
    method: 'GET',
    headers: { Host: prismHost },
    signal: controller.signal,
  };

  const apiUrl = `${prismBaseUrl}/getauthtoken?mobile=${mobileNumber}`;
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        console.log('data', data);
      },
      (err) => {
        console.log(err, '////////////////////////////////');
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

  const apiUrl = `${prismBaseUrl}/getusers?authToken=${authToken}&mobile=${mobileNumber}`;
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        console.log('data', data);
      },
      (err) => {
        if (err.name === 'AbortError') {
          console.log(err);
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

  const apiUrl = `${prismBaseUrl}/getauthtoken?mobile=${mobileNumber}`;
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        console.log('data', data);
      },
      (err) => {
        console.log(err, '////////////////////////////////');
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

  const apiUrl = `${prismBaseUrl}/getusers?authToken=${authToken}&mobile=${mobileNumber}`;
  return await fetch(apiUrl, prismHeaders)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
        console.log('data', data);
      },
      (err) => {
        console.log(err);
      }
    );
}

export async function addToPatientPrismQueue(patientDetails: Patient) {
  console.log('addToPatientPrismQueue');
  const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  const azureServiceBus = new ServiceBusService(serviceBusConnectionString);
  const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME_PATIENTS
    ? process.env.AZURE_SERVICE_BUS_QUEUE_NAME_PATIENTS
    : '';
  azureServiceBus.createTopicIfNotExists(queueName, (topicError) => {
    if (topicError) {
      console.log('topic create error', topicError);
    }
    console.log('connected to topic', queueName);
    const message = 'PRISM_USER_DETAILS:' + patientDetails.mobileNumber;
    azureServiceBus.sendTopicMessage(queueName, message, (sendMsgError) => {
      if (sendMsgError) {
        console.log('send message error', sendMsgError);
      }
      console.log('message sent to topic');
    });
  });
}
