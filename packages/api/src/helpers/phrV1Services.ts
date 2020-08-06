import AbortController from 'abort-controller';
import { debugLog } from 'customWinstonLogger';
import fetch from 'node-fetch';
import fs from 'fs';
import {
  LabResultsUploadResponse,
  LabResultsUploadRequest,
  PrescriptionUploadRequest,
  PrescriptionUploadResponse,
  PrescriptionDownloadResponse,
  LabResultsDownloadResponse,
  GetUsersResponse,
  CreateNewUsersResponse,
  GetAuthTokenResponse,
} from 'types/phrv1';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Patient, Gender } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';
import { getUnixTime, format } from 'date-fns';
import { PrismGetUsersResponse } from 'types/prism';

import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import path from 'path';

const prismTimeoutMillSeconds = Number(process.env.PRISM_TIMEOUT_IN_MILLISECONDS);

const dLogger = debugLog(
  'profileServiceLogger',
  'prismCall',
  Math.floor(Math.random() * 100000000)
);

//save lab results documents
export async function saveLabResults(
  uhid: string,
  uploadParams: LabResultsUploadRequest
): Promise<LabResultsUploadResponse> {
  if (
    !process.env.PHR_V1_SAVE_LABRESULTS ||
    !process.env.PHR_V1_ACCESS_TOKEN ||
    !process.env.PRISM_TIMEOUT_IN_MILLISECONDS
  )
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_SAVE_LABRESULTS.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{UHID}', uhid);
  const reqStartTime = new Date();

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);
  return await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
    body: JSON.stringify(uploadParams),
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'uploadLabResultsToPrism PRISM_UPLOAD_RECORDS_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'uploadLabResultsToPrism PRISM_UPLOAD_RECORDS_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

//save prescription documents
export async function savePrescription(
  uhid: string,
  uploadParams: PrescriptionUploadRequest
): Promise<PrescriptionUploadResponse> {
  if (!process.env.PHR_V1_SAVE_PRESCRIPTIONS || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_SAVE_PRESCRIPTIONS.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{UHID}', uhid);

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);
  return await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
    body: JSON.stringify(uploadParams),
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'uploadPrescriptionsToPrism PRISM_UPLOAD_RECORDS_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'uploadPrescriptionsToPrism PRISM_UPLOAD_RECORDS_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

//get Prescription Data in bulk
export async function getPrescriptionData(uhid: string): Promise<PrescriptionDownloadResponse> {
  if (!process.env.PHR_V1_GET_PRESCRIPTIONS || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_GET_PRESCRIPTIONS.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{UHID}', uhid);

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);
  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'getPriscriptionDataFromPrism PRISM_GET_PRESCRIPTION_API_CALL___END',
          `${apiUrl}--- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.PRISM_PRESCRIPTIONS_FETCH_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'getPriscriptionDataFromPrism PRISM_GET_PRESCRIPTION_API_CALL___ERROR',
          `${apiUrl}--- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.PRISM_PRESCRIPTIONS_FETCH_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

//get Lab Results Data in bulk
export async function getLabResults(uhid: string): Promise<LabResultsDownloadResponse> {
  if (!process.env.PHR_V1_GET_LABRESULTS || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_GET_LABRESULTS.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{UHID}', uhid);

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);
  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'getLabResultsFromPrism PRISM_GET_LABRESULTS_API_CALL___END',
          `${apiUrl}--- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.PRISM_LABRESULTS_FETCH_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'getLabResultsFromPrism PRISM_GET_LABRESULTS_API_CALL___ERROR',
          `${apiUrl}--- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.PRISM_LABRESULTS_FETCH_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

//getUsersData by mobileNumber
export async function getRegisteredUsers(mobileNumber: string): Promise<GetUsersResponse> {
  if (!process.env.PHR_V1_GET_REGISTERED_USERS || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_GET_REGISTERED_USERS.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{MOBILE}', mobileNumber);

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);
  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'getRegisteredUsersFromPrism PRISM_GET_REGISTERED_USERS_API_CALL___END',
          `${apiUrl}--- ${JSON.stringify(data)}`
        );
        //if (data.errorCode) throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'getRegisteredUsersFromPrism PRISM_GET_REGISTERED_USERS_API_CALL___ERROR',
          `${apiUrl}--- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

//create new user in Prism
export async function createPrismUser(
  patientData: Patient,
  uhid: string
): Promise<CreateNewUsersResponse> {
  if (
    !process.env.PHR_V1_CREATE_USER ||
    !process.env.PHR_V1_ACCESS_TOKEN ||
    !process.env.PHR_V1_CREATE_USER_SECURITYKEY
  )
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_CREATE_USER.toString();

  if (patientData.firstName === null || patientData.firstName === '') {
    patientData.firstName = 'New';
  }
  if (patientData.lastName === null || patientData.lastName === '') {
    patientData.lastName = 'User';
  }
  if (patientData.gender === null) {
    patientData.gender = Gender.MALE;
  }
  if (patientData.emailAddress === null) {
    patientData.emailAddress = '';
  }
  let dob = 0;
  if (patientData.dateOfBirth != null) {
    dob = getUnixTime(new Date(patientData.dateOfBirth)) * 1000;
  }

  const queryParams = `securitykey=${
    process.env.PHR_V1_CREATE_USER_SECURITYKEY
  }&gender=${patientData.gender.toLowerCase()}&firstName=${patientData.firstName}&lastName=${
    patientData.lastName
  }&mobile=${patientData.mobileNumber.substr(3)}&uhid=${uhid}&CountryPhoneCode=${
    ApiConstants.COUNTRY_CODE
  }&dob=${dob}&sitekey=&martialStatus=&pincode=&email=${
    patientData.emailAddress
  }&state=&country=&city=&address=`;

  apiUrl = apiUrl + '?' + queryParams;

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);
  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'createNewUser PRISM_CREATE_NEW_USER_API_CALL___END',
          `${apiUrl}--- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.PRISM_CREATE_UHID_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'createNewUser PRISM_CREATE_NEW_USER_API_CALL___ERROR',
          `${apiUrl}--- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.PRISM_CREATE_UHID_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

export async function linkUhid(
  primaryuhid: string,
  uhids: string //coma seperated uhids
): Promise<PrismGetUsersResponse> {
  if (!process.env.PHR_V1_PRISM_LINK_UHID_API || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_PRISM_LINK_UHID_API.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{UHID}', primaryuhid);
  apiUrl = apiUrl.replace('{LINKINGUHIDS}', uhids);

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);

  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'linkUhid PRISM_LINK_UHID_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.PRISM_LINK_UHID_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'linkUhid PRISM_LINK_UHID_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
        );

        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.PRISM_LINK_UHID_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

export async function delinkUhid(
  primaryuhid: string,
  uhids: string //coma seperated uhids
): Promise<PrismGetUsersResponse> {
  if (!process.env.PHR_V1_PRISM_DELINK_UHID_API || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_PRISM_DELINK_UHID_API.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{UHID}', primaryuhid);
  apiUrl = apiUrl.replace('{DELINKINGUHIDS}', uhids);

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);

  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'delinkuhids PRISM_DELINK_UHID_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.PRISM_DELINK_UHID_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'delinkuhids PRISM_DELINK_UHID_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.PRISM_DELINK_UHID_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

export async function getAuthToken(primaryuhid: string): Promise<GetAuthTokenResponse> {
  if (!process.env.PHR_V1_GET_AUTH_TOKEN || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_GET_AUTH_TOKEN.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{UHID}', primaryuhid);

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);

  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'getAuthToken PRISM_GET_AUTH_TOKEN_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'getAuthToken PRISM_GET_AUTH_TOKEN_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

export async function downloadDocumentAndSaveToBlob(
  uhid: string,
  fileUrl: string,
  prismFileId: string
): Promise<string> {
  if (
    !process.env.PHR_V1_DONLOAD_PRESCRIPTION_DOCUMENT ||
    !process.env.PHR_V1_ACCESS_TOKEN ||
    !process.env.PHR_V1_DONLOAD_LABRESULT_DOCUMENT
  )
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  const getToken = await getAuthToken(uhid);

  const fileUrlArray = fileUrl.split('&');
  const fileNameArray = fileUrlArray.filter((item) => item.indexOf('fileName') >= 0);
  const fileName =
    fileNameArray.length > 0
      ? fileNameArray[0].replace('fileName=', '')
      : format(new Date(), 'ddmmyyyy-HHmmss') + '.jpeg';

  let apiUrl = process.env.PHR_V1_DONLOAD_PRESCRIPTION_DOCUMENT.toString();
  if (fileUrl.indexOf('labresults=') > 0)
    apiUrl = process.env.PHR_V1_DONLOAD_LABRESULT_DOCUMENT.toString();
  apiUrl = apiUrl.replace('{AUTH_KEY}', getToken.response);
  apiUrl = apiUrl.replace('{UHID}', uhid);
  apiUrl = apiUrl.replace('{RECORDID}', prismFileId);
  apiUrl = apiUrl.replace('{FILE_NAME}', fileName);

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, prismTimeoutMillSeconds);

  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then(
      async (res) => {
        dLogger(
          reqStartTime,
          'PRISM_DOWNLOAD_FILE_AND_UPLOAD_BLOB_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(res)}`
        );

        const filePath = path.resolve(process.env.ASSETS_DIRECTORY!.toString(), fileName);

        const file = fs.createWriteStream(filePath);
        res.body.pipe(file);
        await delay(350);

        function delay(ms: number) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }

        const client = new AphStorageClient(
          process.env.AZURE_STORAGE_CONNECTION_STRING_API,
          process.env.AZURE_STORAGE_CONTAINER_NAME
        );

        const blob = await client.uploadFile({ name: fileName, filePath });
        const blobUrl = client.getBlobUrl(blob.name);
        fs.unlink(filePath, (error) => console.log(error));
        return blobUrl;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'PRISM_DOWNLOAD_FILE_AND_UPLOAD_BLOB_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
        } else {
          throw new AphError(AphErrorMessages.PRISM_PRESCRIPTIONS_FETCH_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}
