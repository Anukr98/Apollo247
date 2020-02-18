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
  type testSMSResult {
    send: Boolean
  }
  extend type Query {
    login(mobileNumber: String!, loginType: LOGIN_TYPE!): LoginResult!
    resendOtp(mobileNumber: String!, id: String!, loginType: LOGIN_TYPE!): LoginResult!
    testSendSMS(mobileNumber: String!): testSMSResult!
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
  const callStartTime = new Date();
  const apiCallId = Math.floor(Math.random() * 1000000);

  //create first order curried method with first 4 static parameters being passed.
  const loginLogger = debugLog(
    'otpVerificationAPILogger',
    'login',
    apiCallId,
    callStartTime,
    args.mobileNumber
  );

  loginLogger('API_CALL___START');
  const { mobileNumber, loginType } = args;
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  loginLogger('OTP_GENERATION_START');
  let otp = generateOTP();
  loginLogger('OTP_GENERATION_END');

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

  loginLogger('OTP_INSERT_START');
  const optAttrs: Partial<LoginOtp> = {
    loginType,
    mobileNumber,
    otp,
    status: OTP_STATUS.NOT_VERIFIED,
  };
  const otpSaveResponse = await otpRepo.insertOtp(optAttrs);
  loginLogger('OTP_INSERT_END');

  //if performance environment(as), return the response without sending SMS
  if (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') {
    loginLogger('STATIC_OTP_API_CALL___END');
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
    loginLogger('STATIC_OTP_API_CALL___END');
    return {
      status: true,
      loginId: otpSaveResponse.id,
      message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
    };
  }

  //call sms gateway service to send the OTP here
  loginLogger('SEND_SMS___START');
  const smsResult = await sendSMS(mobileNumber, otp);
  loginLogger('SEND_SMS___END');

  console.log(smsResult.status, smsResult);
  if (smsResult.status != 'OK') {
    loginLogger('SEND_SMS_FAILED_API_CALL___END');
    return {
      status: false,
      loginId: null,
      message: ApiConstants.OTP_FAIL_MESSAGE.toString(),
    };
  }

  loginLogger('API_CALL___END');
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
  const apiCallId = Math.floor(Math.random() * 1000000);
  const callStartTime = new Date();
  //create first order curried method with first 4 static parameters being passed.
  const resendLogger = debugLog(
    'otpVerificationAPILogger',
    'resendOtp',
    apiCallId,
    callStartTime,
    args.mobileNumber
  );

  resendLogger('API_CALL___START');

  const { mobileNumber, id, loginType } = args;
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  //validate resend params
  resendLogger('QUERY___START');
  const validResendRecord = await otpRepo.getValidOtpRecord(id, mobileNumber);
  resendLogger('QUERY___END');

  if (validResendRecord.length === 0) {
    resendLogger('VALIDATION_FAILED_API_CALL___END');
    return {
      status: false,
      loginId: null,
      message: ApiConstants.INVALID_RESEND_MESSAGE.toString(),
    };
  }

  resendLogger('OTP_GENERATION_START');
  let otp = generateOTP();
  resendLogger('OTP_GENERATION_END');

  //if performance environment(as), use the static otp
  if (
    (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') &&
    process.env.PERFORMANCE_ENV_STATIC_OTP
  ) {
    otp = process.env.PERFORMANCE_ENV_STATIC_OTP.toString();
  }

  resendLogger('UPDATION_START');
  const optAttrs: Partial<LoginOtp> = {
    mobileNumber,
    otp,
    loginType,
    status: OTP_STATUS.NOT_VERIFIED,
  };
  const otpSaveResponse = await otpRepo.insertOtp(optAttrs);

  //archive the old resend record and then delete it
  archiveOtpRecord(validResendRecord[0].id, profilesDb);
  resendLogger('UPDATION_END');

  //if performance environment(as), return the response without sending SMS
  if (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') {
    resendLogger('STATIC_OTP_API_CALL___END');
    return {
      status: true,
      loginId: otpSaveResponse.id,
      message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
    };
  }

  //call sms gateway service to send the OTP here
  resendLogger('SEND_SMS___START');
  const smsResult = await sendSMS(mobileNumber, otp);
  resendLogger('SEND_SMS___END');

  console.log(smsResult.status, smsResult);
  if (smsResult.status != 'OK') {
    resendLogger('SEND_SMS_FAILED_API_CALL___END');
    return {
      status: false,
      loginId: null,
      message: ApiConstants.OTP_FAIL_MESSAGE.toString(),
    };
  }

  resendLogger('API_CALL___END');
  return {
    status: true,
    loginId: otpSaveResponse.id,
    message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
  };
};
type testSMSResult = {
  send: Boolean;
};
const testSendSMS: Resolver<
  null,
  { mobileNumber: string },
  ProfilesServiceContext,
  testSMSResult
> = async (parent, args, { profilesDb }) => {
  const { mobileNumber } = args;
  //const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);
  const otp = generateOTP();

  //call sms gateway service to send the OTP here
  const smsResult = await testSMS(mobileNumber, otp);

  console.log(smsResult.status, smsResult);
  if (smsResult.status != 'OK') {
    return {
      send: false,
    };
  }

  return {
    send: true,
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
const testSMS = async (mobileNumber: string, otp: string) => {
  const apiBaseUrl = process.env.KALEYRA_OTP_API_BASE_URL;
  const apiUrlWithKey = `${apiBaseUrl}?api_key=${process.env.KALEYRA_OTP_API_KEY}`;

  //let message = ApiConstants.OTP_MESSAGE_TEXT.replace('{0}', otp);

  //message = message.replace('{1}', ApiConstants.OTP_EXPIRATION_MINUTES.toString());
  const message =
    'Thanks for choosing Apollo24X7, Ravikiran :) Your appointment <Appointment  No.> with Dr. Strange is confirmed for <Appointment Date and Time> Click here to fill your details before your consultation starts. This will take hardly 10 minutes and will help our doctor to assist you better.';
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

  return smsResponse;
};
export const sendNotificationSMS = async (mobileNumber: string, message: string) => {
  const apiBaseUrl = process.env.KALEYRA_OTP_API_BASE_URL;
  const apiUrlWithKey = `${apiBaseUrl}?api_key=${process.env.KALEYRA_OTP_API_KEY}`;

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
  return smsResponse;
};
export const loginResolvers = {
  Query: {
    login,
    resendOtp,
    testSendSMS,
  },
};
