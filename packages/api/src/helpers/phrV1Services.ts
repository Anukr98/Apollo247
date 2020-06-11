import AbortController from 'abort-controller';
import { debugLog } from 'customWinstonLogger';
import { LabResultsUploadResponse, LabResultsUploadRequest } from 'types/phrv1';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

const prismTimeoutMillSeconds = process.env.PRISM_TIMEOUT_IN_MILLISECONDS
  ? Number(process.env.PRISM_TIMEOUT_IN_MILLISECONDS)
  : 3000;
const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, prismTimeoutMillSeconds); //TODO: change this to env variable

const dLogger = debugLog(
  'profileServiceLogger',
  'prismCall',
  Math.floor(Math.random() * 100000000)
);

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
  const linkResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(uploadParams),
  });

  if (linkResponse.ok) {
    const responseData = await linkResponse.json();
    console.log('responseData::', responseData);
    dLogger(
      reqStartTime,
      'uploadDocumentToPrism PRISM_UPLOAD_RECORDS_API_CALL___END',
      `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${responseData}`
    );
    return responseData;
  } else {
    const responseData = await linkResponse.text();
    dLogger(
      reqStartTime,
      'uploadDocumentToPrism PRISM_UPLOAD_RECORDS_API_CALL___ERROR',
      `${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${responseData}`
    );
    throw new AphError(AphErrorMessages.DEEPLINK_EXTERNAL_CALL_FAILED);
  }
}
