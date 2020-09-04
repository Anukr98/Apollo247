import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { LoginOtp, LOGIN_TYPE, OTP_STATUS } from 'profiles-service/entities';
import { LoginOtpRepository } from 'profiles-service/repositories/loginOtpRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { ApiConstants } from 'ApiConstants';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import { debugLog } from 'customWinstonLogger';
import {
  sendDoctorNotificationWhatsapp,
  isNotificationAllowed,
} from 'notifications-service/handlers';

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
    login(mobileNumber: String!, loginType: LOGIN_TYPE!, hashCode: String): LoginResult!
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
  { mobileNumber: string; loginType: LOGIN_TYPE; hashCode: string },
  ProfilesServiceContext,
  LoginResult
> = async (parent, args, { profilesDb, doctorsDb }) => {
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
  const { mobileNumber, loginType, hashCode } = args;
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  loginLogger('OTP_GENERATION_START');
  let otp = generateOTP();
  loginLogger('OTP_GENERATION_END');
  // get static otp env specific
  const staticOTP = getStaticOTP({ mobileNumber });
  otp = staticOTP ? staticOTP : otp;

  loginLogger('OTP_INSERT_START');
  const optAttrs: Partial<LoginOtp> = {
    loginType,
    mobileNumber,
    otp,
    status: OTP_STATUS.NOT_VERIFIED,
  };

  const { id } = await otpRepo.insertOtp(optAttrs);
  loginLogger('OTP_INSERT_END');

  // bypass otp env specific
  const bypassRes = OTPBypass({ id, logger: loginLogger });
  if (bypassRes) return bypassRes;

  //call sms gateway service to send the OTP here
  return sendMessage({
    doctorsDb,
    loginType,
    mobileNumber,
    otp,
    hashCode,
    logger: loginLogger,
    id,
  });
};

const resendOtp: Resolver<
  null,
  { mobileNumber: string; id: string; loginType: LOGIN_TYPE; hashCode: string },
  ProfilesServiceContext,
  LoginResult
> = async (parent, args, { profilesDb, doctorsDb }) => {
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

  const { mobileNumber, id, loginType, hashCode } = args;
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  //validate resend params
  resendLogger('QUERY___START');
  const validResendRecord = await otpRepo.getValidOtpRecord(id);
  resendLogger('QUERY___END');

  if (!validResendRecord) {
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
  return sendMessage({
    doctorsDb,
    loginType,
    mobileNumber,
    otp,
    hashCode,
    logger: resendLogger,
    id,
  });
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
const sendSMS = async (mobileNumber: string, otp: string, hashCode: string, message: string) => {
  const apiBaseUrl = process.env.KALEYRA_OTP_API_BASE_URL;
  const apiUrlWithKey = `${apiBaseUrl}?api_key=${process.env.KALEYRA_OTP_API_KEY}`;
  if (hashCode) {
    message = message + ' ' + encodeURIComponent(hashCode);
  }
  const queryParams = `&method=${ApiConstants.KALEYRA_OTP_SMS_METHOD}&message=${message}&to=${mobileNumber}&sender=${ApiConstants.KALEYRA_OTP_SENDER}`;

  const apiUrl = `${apiUrlWithKey}${queryParams}`;

  //logging api call data here
  log('smsOtpAPILogger', `OPT_API_CALL: ${apiUrl}`, 'sendSMS()->API_CALL_STARTING', '', '');

  const isWhitelisted = await isNotificationAllowed(mobileNumber);
  if (!isWhitelisted) {
    return;
  }
  const smsResponse = await fetch(apiUrl)
    .then((res) => res.json())
    .catch((error) => {
      //logging error here
      log('smsOtpAPILogger', `API_CALL_ERROR`, 'sendSMS()->CATCH_BLOCK', '', JSON.stringify(error));
      throw new AphError(AphErrorMessages.CREATE_OTP_ERROR);
    });
  //sendNotificationWhatsapp(mobileNumber, message);
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
  const isWhitelisted = await isNotificationAllowed(mobileNumber);
  if (!isWhitelisted) {
    return {
      status: null,
    };
  }

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

export const loginResolvers = {
  Query: {
    login,
    resendOtp,
    testSendSMS,
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendMessage = async (args: any) => {
  const { loginType, mobileNumber, otp, hashCode, logger, id, doctorsDb } = args;

  const isWhitelisted = await isNotificationAllowed(mobileNumber);
  if (!isWhitelisted) {
    return {
      status: true,
      loginId: id,
      message: ApiConstants.OTP_NON_WHITELISTED_NUMBER.toString(),
    };
  }

  logger('SEND_SMS___START');
  let textMessage;

  //let smsResult;
  if (loginType == LOGIN_TYPE.DOCTOR) {
    //const whatsAppMessage = ApiConstants.DOCTOR_WHATSAPP_OTP.replace('{0}', otp);
    const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctor = await doctorRepo.searchDoctorByMobileNumber(mobileNumber, true);
    if (doctor == null) {
      throw new AphError(AphErrorMessages.NOT_A_DOCTOR);
    }
    const templateData: string[] = [otp];
    const promiseSendNotification = sendDoctorNotificationWhatsapp(
      ApiConstants.WHATSAPP_SD_OTP,
      mobileNumber,
      templateData
    );
    textMessage = ApiConstants.DOCTOR_OTP_MESSAGE_TEXT.replace('{0}', otp).replace(
      '{1}',
      ApiConstants.OTP_EXPIRATION_MINUTES.toString()
    );
    const promiseSendSMS = sendSMS(mobileNumber, otp, hashCode, textMessage);
    await Promise.all([
      promiseSendNotification.catch((err) => {
        log(
          'smsOtpAPILogger',
          `API_CALL_ERROR`,
          'sendDoctorNotificationWhatsapp()->CATCH_BLOCK',
          '',
          JSON.stringify(err)
        );
        return err;
      }),
      promiseSendSMS.catch((err) => {
        log('smsOtpAPILogger', `API_CALL_ERROR`, 'sendSMS()->CATCH_BLOCK', '', JSON.stringify(err));
        return err;
      }),
    ]);
  } else {
    textMessage = ApiConstants.PATIENT_OTP_MESSAGE_TEXT.replace('{0}', otp).replace(
      '{1}',
      ApiConstants.OTP_EXPIRATION_MINUTES.toString()
    );
    await sendSMS(mobileNumber, otp, hashCode, textMessage);
  }
  logger('SEND_SMS___END');

  logger('API_CALL___END');
  return {
    status: true,
    loginId: id,
    message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OTPBypass = (args: any) => {
  const { mobileNumber, id, logger } = args;
  //if production environment, and specific mobileNumber, return the response without sending SMS
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.PRODUCTION_ENV_STATIC_APP_STORE_MOBILE_NUMBER &&
    process.env.PRODUCTION_ENV_STATIC_APP_STORE_OTP &&
    mobileNumber == process.env.PRODUCTION_ENV_STATIC_APP_STORE_MOBILE_NUMBER
  ) {
    logger('STATIC_OTP_API_CALL___END');
    return {
      status: true,
      loginId: id,
      message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
    };
  }
  //if performance environment(as), return the response without sending SMS
  if (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') {
    logger('STATIC_OTP_API_CALL___END');
    return {
      status: true,
      loginId: id,
      message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
    };
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStaticOTP = (args: any) => {
  const { mobileNumber } = args;
  //if performance environment(as), use the static otp
  if (
    (process.env.NODE_ENV === 'as' || process.env.NODE_ENV === 'dev') &&
    process.env.PERFORMANCE_ENV_STATIC_OTP
  ) {
    return process.env.PERFORMANCE_ENV_STATIC_OTP.toString();
  }
  //if staging environment, and specific mobileNumber, use the static otp
  if (
    process.env.NODE_ENV === 'staging' &&
    process.env.STAGING_ENV_STATIC_APP_STORE_MOBILE_NUMBER &&
    process.env.STAGING_ENV_STATIC_APP_STORE_OTP &&
    mobileNumber == process.env.STAGING_ENV_STATIC_APP_STORE_MOBILE_NUMBER
  ) {
    return process.env.STAGING_ENV_STATIC_APP_STORE_OTP.toString();
  }
  //if production environment, and specific mobileNumber, use the static otp
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.PRODUCTION_ENV_STATIC_APP_STORE_MOBILE_NUMBER &&
    process.env.PRODUCTION_ENV_STATIC_APP_STORE_OTP &&
    mobileNumber == process.env.PRODUCTION_ENV_STATIC_APP_STORE_MOBILE_NUMBER
  ) {
    return process.env.PRODUCTION_ENV_STATIC_APP_STORE_OTP.toString();
  }

  return null;
};
