import { DeepLinkInput } from 'types/deeplinks';
import { ApiConstants } from 'ApiConstants';
import { Deeplink, Doctor, DoctorType } from 'doctors-service/entities';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { debugLog } from 'customWinstonLogger';

const dLogger = debugLog(
  'doctorServiceLogger',
  'Dcotor Deeplink Generate',
  Math.floor(Math.random() * 100000000)
);

export async function getDeeplink(deepLinkInput: DeepLinkInput) {
  const reqStartTime = new Date();
  const linkResponse = await fetch(ApiConstants.DOCTOR_DEEPLINK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: ApiConstants.DEEPLINK_AUTHORIZATION.toString(),
    },
    body: JSON.stringify(deepLinkInput),
  });

  if (linkResponse.ok) {
    dLogger(
      reqStartTime,
      'Call to apps flyer APPSFLYER_GET_DOCTORS_DEEPLINK',
      `${ApiConstants.DOCTOR_DEEPLINK_URL} --- ${JSON.stringify(
        deepLinkInput
      )} --- ${JSON.stringify(linkResponse.text())}`
    );
    return await linkResponse.text();
  } else {
    dLogger(
      reqStartTime,
      'Call to apps flyer APPSFLYER_GET_DOCTORS_DEEPLINK___ERROR',
      `${ApiConstants.DOCTOR_DEEPLINK_URL} --- ${JSON.stringify(
        deepLinkInput
      )} --- ${JSON.stringify(linkResponse.body)}`
    );
    throw new AphError(AphErrorMessages.DEEPLINK_EXTERNAL_CALL_FAILED);
  }
}

export async function refreshLink(existingDeeplinkDetails: Deeplink) {
  const reqStartTime = new Date();

  //doctor deeplink
  const af_dp = ApiConstants.DOCTOR_DEEPLINK_CONSTANT.toString() + existingDeeplinkDetails.doctorId;
  const deepLinkInput: DeepLinkInput = {
    brand_domain: ApiConstants.BRAND_DOMAIN.toString(),
    ttl: ApiConstants.LINK_TTL.toString(),
    data: {
      pid: ApiConstants.PARTNER_ID.toString(),
      c: existingDeeplinkDetails.campaignName,
      af_channel: ApiConstants.CHANNEL_NAME.toString(),
      af_dp: af_dp,
      af_sub1: existingDeeplinkDetails.referralCode,
      af_force_deeplink: 'true',
    },
  };

  const apiUrl = ApiConstants.DOCTOR_DEEPLINK_URL + '?id=' + existingDeeplinkDetails.shortId;
  const linkResponse = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: ApiConstants.DEEPLINK_AUTHORIZATION.toString(),
    },
    body: JSON.stringify(deepLinkInput),
  });

  if (linkResponse.ok) {
    dLogger(
      reqStartTime,
      'Call to apps flyer APPSFLYER_GET_DOCTORS_DEEPLINK_REFRESH',
      `${ApiConstants.DOCTOR_DEEPLINK_URL} --- ${JSON.stringify(
        deepLinkInput
      )} --- ${JSON.stringify(linkResponse.text())}`
    );
    return await linkResponse.text();
  } else {
    dLogger(
      reqStartTime,
      'Call to apps flyer APPSFLYER_GET_DOCTORS_DEEPLINK_REFRESH___ERROR',
      `${ApiConstants.DOCTOR_DEEPLINK_URL} --- ${JSON.stringify(
        deepLinkInput
      )} --- ${JSON.stringify(linkResponse.body)}`
    );
    throw new AphError(AphErrorMessages.DEEPLINK_EXTERNAL_CALL_FAILED);
  }
}

export function generateDeepLinkBody(doctordata: Partial<Doctor>): DeepLinkInput {
  //generate campaign
  let mciNumber = doctordata.registrationNumber ? doctordata.registrationNumber : '0';
  mciNumber = mciNumber.split('/').join('-');
  mciNumber = mciNumber.split(' ').join('-');
  const campaign = doctordata.fullName + '-' + mciNumber;

  //doctor deeplink
  const af_dp = ApiConstants.DOCTOR_DEEPLINK_CONSTANT.toString() + doctordata.id;

  //generate rerralcode
  let referralCode = Math.floor(Math.random() * 10000000000).toString();
  referralCode =
    doctordata.doctorType == DoctorType.DOCTOR_CONNECT ? 'C-' + referralCode : 'A-' + referralCode;

  const deepLinkAttrs: DeepLinkInput = {
    brand_domain: ApiConstants.BRAND_DOMAIN.toString(),
    ttl: ApiConstants.LINK_TTL.toString(),
    data: {
      pid: ApiConstants.PARTNER_ID.toString(),
      c: campaign,
      af_channel: ApiConstants.CHANNEL_NAME.toString(),
      af_dp: af_dp,
      af_sub1: referralCode,
      af_force_deeplink: 'true',
    },
  };
  return deepLinkAttrs;
}
