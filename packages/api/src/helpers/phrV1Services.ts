import AbortController from 'abort-controller';
import { debugLog } from 'customWinstonLogger';
import {
  LabResultsUploadResponse,
  LabResultsUploadRequest,
  PrescriptionUploadRequest,
  PrescriptionUploadResponse,
} from 'types/phrv1';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

const prismTimeoutMillSeconds = process.env.PRISM_TIMEOUT_IN_MILLISECONDS
  ? Number(process.env.PRISM_TIMEOUT_IN_MILLISECONDS)
  : 10000;

const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, prismTimeoutMillSeconds);

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
  if (!process.env.PHR_V1_SAVE_LABRESULTS || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let apiUrl = process.env.PHR_V1_SAVE_LABRESULTS.toString();
  apiUrl = apiUrl.replace('{ACCESS_KEY}', process.env.PHR_V1_ACCESS_TOKEN);
  apiUrl = apiUrl.replace('{UHID}', uhid);

  const reqStartTime = new Date();
  const phrResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
    body: JSON.stringify(uploadParams),
  }).catch((error) => {
    if (error.name === 'AbortError') {
      throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
    } else {
      throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
    }
  });

  const responseData = await phrResponse.json();
  clearTimeout(timeout);

  if (phrResponse.ok) {
    dLogger(
      reqStartTime,
      'uploadLabResultsToPrism PRISM_UPLOAD_RECORDS_API_CALL___END',
      `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${responseData}`
    );
    return responseData;
  } else {
    dLogger(
      reqStartTime,
      'uploadLabResultsToPrism PRISM_UPLOAD_RECORDS_API_CALL___ERROR',
      `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${responseData}`
    );
    throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  }
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
  const phrResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
    body: JSON.stringify(uploadParams),
  }).catch((error) => {
    if (error.name === 'AbortError') {
      throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_PRISM);
    } else {
      throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
    }
  });

  const responseData = await phrResponse.json();
  clearTimeout(timeout);

  if (phrResponse.ok) {
    dLogger(
      reqStartTime,
      'uploadPrescriptionToPrism PRISM_UPLOAD_RECORDS_API_CALL___END',
      `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${responseData}`
    );
    return responseData;
  } else {
    dLogger(
      reqStartTime,
      'uploadPrescriptionToPrism PRISM_UPLOAD_RECORDS_API_CALL___ERROR',
      `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${responseData}`
    );
    throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  }
}
