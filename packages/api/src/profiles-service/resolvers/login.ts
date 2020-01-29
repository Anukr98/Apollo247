import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { LoginOtp, LOGIN_TYPE, OTP_STATUS } from 'profiles-service/entities';
import { LoginOtpRepository } from 'profiles-service/repositories/loginOtpRepository';
import { LoginOtpArchiveRepository } from 'profiles-service/repositories/loginOtpArchiveRepository';

import { ApiConstants } from 'ApiConstants';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import { Connection } from 'typeorm';
import { debugLog } from 'customWinstonLogger';

export const loginTypeDefs = gql`
  enum LOGIN_TYPE {
    PATIENT
    DOCTOR
  }

  enum OTP_STATUS {
    NOT_VERIFIED
    VERIFIED
    EXPIRED
    BLOCKED
  }

  type LoginResult {
    status: Boolean!
    loginId: String
    message: String
  }

  extend type Query {
    login(mobileNumber: String!, loginType: LOGIN_TYPE!): LoginResult!
    resendOtp(mobileNumber: String!, id: String!, loginType: LOGIN_TYPE!): LoginResult!
  }
`;

type LoginResult = {
  status: Boolean;
  loginId: String | null;
  message: string;
};

const login: Resolver<
  null,
  { mobileNumber: string; loginType: LOGIN_TYPE },
  ProfilesServiceContext,
  LoginResult
> = async (parent, args, { profilesDb }) => {
  const apiCallId = Math.floor(Math.random() * 10000);
  debugLog('otpVerificationAPILogger', 'API_CALL___START', 'login_API_' + apiCallId);
  const { mobileNumber, loginType } = args;
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  debugLog('otpVerificationAPILogger', 'OTP_GENERATION_START', 'login_API_' + apiCallId);
  let otp = generateOTP();
  debugLog('otpVerificationAPILogger', 'OTP_GENERATION_END', 'login_API_' + apiCallId);

  //if performance environment(as), use the static otp
  if (
    (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') &&
    process.env.PERFORMANCE_ENV_STATIC_OTP
  ) {
    otp = process.env.PERFORMANCE_ENV_STATIC_OTP.toString();
  }

  //if production environment, and specific mobileNumber, use the static otp
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.PRODUCTION_ENV_STATIC_APP_STORE_MOBILE_NUMBER &&
    process.env.PRODUCTION_ENV_STATIC_APP_STORE_OTP &&
    mobileNumber == process.env.PRODUCTION_ENV_STATIC_APP_STORE_MOBILE_NUMBER
  ) {
    otp = process.env.PRODUCTION_ENV_STATIC_APP_STORE_OTP.toString();
  }

  debugLog('otpVerificationAPILogger', 'OTP_INSERT_START', 'login_API_' + apiCallId);
  const optAttrs: Partial<LoginOtp> = {
    loginType,
    mobileNumber,
    otp,
    status: OTP_STATUS.NOT_VERIFIED,
  };

  const otpSaveResponse = await otpRepo.insertOtp(optAttrs);

  debugLog('otpVerificationAPILogger', 'OTP_INSERT_END', 'login_API_' + apiCallId);

  //if performance environment(as), return the response without sending SMS
  if (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') {
    debugLog('otpVerificationAPILogger', 'STATIC_OTP_API_CALL___END', 'login_API_' + apiCallId);
    return {
      status: true,
      loginId: otpSaveResponse.id,
      message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
    };
  }

  //if production environment, and specific mobileNumber, return the response without sending SMS
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.PRODUCTION_ENV_STATIC_APP_STORE_MOBILE_NUMBER &&
    process.env.PRODUCTION_ENV_STATIC_APP_STORE_OTP &&
    mobileNumber == process.env.PRODUCTION_ENV_STATIC_APP_STORE_MOBILE_NUMBER
  ) {
    debugLog('otpVerificationAPILogger', 'STATIC_OTP_API_CALL___END', 'login_API_' + apiCallId);
    return {
      status: true,
      loginId: otpSaveResponse.id,
      message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
    };
  }

  //call sms gateway service to send the OTP here
  debugLog('otpVerificationAPILogger', 'SEND_SMS___START', 'login_API_' + apiCallId);
  const smsResult = await sendSMS(mobileNumber, otp);
  debugLog('otpVerificationAPILogger', 'SEND_SMS___END', 'login_API_' + apiCallId);

  console.log(smsResult.status, smsResult);
  if (smsResult.status != 'OK') {
    debugLog(
      'otpVerificationAPILogger',
      'SEND_SMS_FAILED_API_CALL___END',
      'login_API_' + apiCallId
    );
    return {
      status: false,
      loginId: null,
      message: ApiConstants.OTP_FAIL_MESSAGE.toString(),
    };
  }

  debugLog('otpVerificationAPILogger', 'API_CALL___END', 'login_API_' + apiCallId);
  return {
    status: true,
    loginId: otpSaveResponse.id,
    message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
  };
};

const resendOtp: Resolver<
  null,
  { mobileNumber: string; id: string; loginType: LOGIN_TYPE },
  ProfilesServiceContext,
  LoginResult
> = async (parent, args, { profilesDb }) => {
  const apiCallId = Math.floor(Math.random() * 10000);
  debugLog('otpVerificationAPILogger', 'API_CALL___START', 'resendOtp_API_' + apiCallId);

  const { mobileNumber, id, loginType } = args;
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  //validate resend params
  debugLog('otpVerificationAPILogger', 'QUERY___START', 'resendOtp_API_' + apiCallId);
  const validResendRecord = await otpRepo.getValidOtpRecord(id, mobileNumber);
  debugLog('otpVerificationAPILogger', 'QUERY___END', 'resendOtp_API_' + apiCallId);

  if (validResendRecord.length === 0) {
    debugLog(
      'otpVerificationAPILogger',
      'VALIDATION_FAILED_API_CALL___END',
      'resendOtp_API_' + apiCallId
    );
    return {
      status: false,
      loginId: null,
      message: ApiConstants.INVALID_RESEND_MESSAGE.toString(),
    };
  }

  debugLog('otpVerificationAPILogger', 'OTP_GENERATION_START', 'resendOtp_API_' + apiCallId);
  let otp = generateOTP();
  debugLog('otpVerificationAPILogger', 'OTP_GENERATION_END', 'resendOtp_API_' + apiCallId);

  //if performance environment(as), use the static otp
  if (
    (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') &&
    process.env.PERFORMANCE_ENV_STATIC_OTP
  ) {
    otp = process.env.PERFORMANCE_ENV_STATIC_OTP.toString();
  }

  debugLog('otpVerificationAPILogger', 'UPDATION_START', 'resendOtp_API_' + apiCallId);

  const optAttrs: Partial<LoginOtp> = {
    mobileNumber,
    otp,
    loginType,
    status: OTP_STATUS.NOT_VERIFIED,
  };

  const otpSaveResponse = await otpRepo.insertOtp(optAttrs);

  //archive the old resend record and then delete it
  archiveOtpRecord(validResendRecord[0].id, profilesDb);

  debugLog('otpVerificationAPILogger', 'UPDATION_END', 'resendOtp_API_' + apiCallId);

  //if performance environment(as), return the response without sending SMS
  if (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') {
    debugLog('otpVerificationAPILogger', 'STATIC_OTP_API_CALL___END', 'resendOtp_API_' + apiCallId);
    return {
      status: true,
      loginId: otpSaveResponse.id,
      message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
    };
  }

  //call sms gateway service to send the OTP here
  debugLog('otpVerificationAPILogger', 'SEND_SMS___START', 'resendOtp_API_' + apiCallId);
  const smsResult = await sendSMS(mobileNumber, otp);
  debugLog('otpVerificationAPILogger', 'SEND_SMS___END', 'resendOtp_API_' + apiCallId);

  console.log(smsResult.status, smsResult);
  if (smsResult.status != 'OK') {
    debugLog(
      'otpVerificationAPILogger',
      'SEND_SMS_FAILED_API_CALL___END',
      'resendOtp_API_' + apiCallId
    );
    return {
      status: false,
      loginId: null,
      message: ApiConstants.OTP_FAIL_MESSAGE.toString(),
    };
  }

  debugLog('otpVerificationAPILogger', 'API_CALL___END', 'resendOtp_API_' + apiCallId);
  return {
    status: true,
    loginId: otpSaveResponse.id,
    message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
  };
};

export const archiveOtpRecord = async (otpRecordId: string, profilesDb: Connection) => {
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);
  const otpRecord = await otpRepo.findById(otpRecordId);
  if (otpRecord) {
    const recordAttrs = {
      loginType: otpRecord.loginType,
      mobileNumber: otpRecord.mobileNumber,
      otp: otpRecord.otp,
      status: otpRecord.status,
      incorrectAttempts: otpRecord.incorrectAttempts,
    };

    const otpArchiveRepo = profilesDb.getCustomRepository(LoginOtpArchiveRepository);
    await otpArchiveRepo.archiveOtpRecord(recordAttrs);
    otpRepo.deleteOtpRecord(otpRecord.id);
  }
};

//returns random 6 digit number string
export const generateOTP = () => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

//utility method to send SMS
const sendSMS = async (mobileNumber: string, otp: string) => {
  const apiBaseUrl = process.env.KALEYRA_OTP_API_BASE_URL;
  const apiUrlWithKey = `${apiBaseUrl}?api_key=${process.env.KALEYRA_OTP_API_KEY}`;

  let message = ApiConstants.OTP_MESSAGE_TEXT.replace('{0}', otp);
  message = message.replace('{1}', ApiConstants.OTP_EXPIRATION_MINUTES.toString());

  const queryParams = `&method=${ApiConstants.KALEYRA_OTP_SMS_METHOD}&message=${message}&to=${mobileNumber}&sender=${ApiConstants.KALEYRA_OTP_SENDER}`;

  const apiUrl = `${apiUrlWithKey}${queryParams}`;

  //logging api call data here
  log('smsOtpAPILogger', `OPT_API_CALL: ${apiUrl}`, 'sendSMS()->API_CALL_STARTING', '', '');

  const smsResponse = await fetch(apiUrl)
    .then((res) => res.json())
    .catch((error) => {
      //logging error here
      log('smsOtpAPILogger', `API_CALL_ERROR`, 'sendSMS()->CATCH_BLOCK', '', JSON.stringify(error));
      throw new AphError(AphErrorMessages.CREATE_OTP_ERROR);
    });

  //logging success response here
  log(
    'smsOtpAPILogger',
    'API_CALL_RESPONSE',
    'sendSMS()->API_CALL_RESPONSE',
    JSON.stringify(smsResponse),
    ''
  );
  return smsResponse;
};

export const loginResolvers = {
  Query: {
    login,
    resendOtp,
  },
};
