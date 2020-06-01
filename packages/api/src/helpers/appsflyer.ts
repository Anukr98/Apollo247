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

export async function getDeeplink(deepLinkInput: DeepLinkInput, doctorType: DoctorType) {
  const templateId =
    doctorType == DoctorType.DOCTOR_CONNECT
      ? ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_NON_APOLLO.toString()
      : ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_APOLLO.toString();

  const apiUrl = ApiConstants.DOCTOR_DEEPLINK_URL + templateId;

  const reqStartTime = new Date();
  const linkResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: ApiConstants.DEEPLINK_AUTHORIZATION.toString(),
    },
    body: JSON.stringify(deepLinkInput),
  });

  if (linkResponse.ok) {
    const responseData = await linkResponse.text();
    dLogger(
      reqStartTime,
      'Call to apps flyer APPSFLYER_GET_DOCTORS_DEEPLINK',
      `${apiUrl} --- ${JSON.stringify(deepLinkInput)} --- ${responseData}`
    );
    return responseData;
  } else {
    const responseData = await linkResponse.text();
    dLogger(
      reqStartTime,
      'Call to apps flyer APPSFLYER_GET_DOCTORS_DEEPLINK___ERROR',
      `${apiUrl} --- ${JSON.stringify(deepLinkInput)} --- ${responseData}`
    );
    throw new AphError(AphErrorMessages.DEEPLINK_EXTERNAL_CALL_FAILED);
  }
}

export async function refreshLink(existingDeeplinkDetails: Deeplink, doctorType: DoctorType) {
  const reqStartTime = new Date();

  //doctor deeplink
  const af_dp = ApiConstants.DOCTOR_DEEPLINK_CONSTANT.toString() + existingDeeplinkDetails.doctorId;
  const deepLinkInput: DeepLinkInput = {
    brand_domain: ApiConstants.BRAND_DOMAIN.toString(),
    ttl: ApiConstants.LINK_TTL.toString(),
    data: {
      pid: existingDeeplinkDetails.partnerId,
      c: existingDeeplinkDetails.campaignName,
      af_channel: existingDeeplinkDetails.channelName,
      af_dp: af_dp,
      af_sub1: existingDeeplinkDetails.referralCode,
      af_force_deeplink: 'true',
    },
  };

  const templateId =
    doctorType == DoctorType.DOCTOR_CONNECT
      ? ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_NON_APOLLO.toString()
      : ApiConstants.DOCTOR_DEEPLINK_TEMPLATE_ID_APOLLO.toString();

  const apiUrl =
    ApiConstants.DOCTOR_DEEPLINK_URL + templateId + '?id=' + existingDeeplinkDetails.shortId;

  const linkResponse = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: ApiConstants.DEEPLINK_AUTHORIZATION.toString(),
    },
    body: JSON.stringify(deepLinkInput),
  });

  if (linkResponse.ok) {
    const responseData = await linkResponse.text();
    dLogger(
      reqStartTime,
      'Call to apps flyer APPSFLYER_GET_DOCTORS_DEEPLINK_REFRESH',
      `${apiUrl} --- ${JSON.stringify(deepLinkInput)} --- ${responseData}`
    );
    return responseData;
  } else {
    const responseData = await linkResponse.text();
    dLogger(
      reqStartTime,
      'Call to apps flyer APPSFLYER_GET_DOCTORS_DEEPLINK_REFRESH___ERROR',
      `${apiUrl} --- ${JSON.stringify(deepLinkInput)} --- ${responseData}`
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

  const partnerId =
    doctordata.doctorType == DoctorType.DOCTOR_CONNECT
      ? ApiConstants.PARTNER_ID_NON_APOLLO.toString()
      : ApiConstants.PARTNER_ID_APOLLO.toString();

  const channelName =
    doctordata.doctorType == DoctorType.DOCTOR_CONNECT
      ? ApiConstants.CHANNEL_NAME_NON_APOLLO.toString()
      : ApiConstants.CHANNEL_NAME_APOLLO.toString();

  const deepLinkAttrs: DeepLinkInput = {
    brand_domain: ApiConstants.BRAND_DOMAIN.toString(),
    ttl: ApiConstants.LINK_TTL.toString(),
    data: {
      pid: partnerId,
      c: campaign,
      af_channel: channelName,
      af_dp: af_dp,
      af_sub1: referralCode,
      af_force_deeplink: 'true',
    },
  };
  return deepLinkAttrs;
}
