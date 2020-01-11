import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { LoginOtp, LOGIN_TYPE, OTP_STATUS } from 'profiles-service/entities';
import { LoginOtpRepository } from 'profiles-service/repositories/loginOtpRepository';
import { ApiConstants } from 'ApiConstants';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';

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
  const { mobileNumber, loginType } = args;
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);
  const otp = generateOTP();

  const optAttrs: Partial<LoginOtp> = {
    loginType,
    mobileNumber,
    otp,
    status: OTP_STATUS.NOT_VERIFIED,
  };

  const otpSaveResponse = await otpRepo.insertOtp(optAttrs);

  //call sms gateway service to send the OTP here
  const smsResult = await sendSMS(mobileNumber, otp);
  console.log(smsResult.status, smsResult);
  if (smsResult.status != 'OK') {
    return {
      status: false,
      loginId: null,
      message: ApiConstants.OTP_FAIL_MESSAGE.toString(),
    };
  }

  return {
    status: true,
    loginId: otpSaveResponse.id,
    message: ApiConstants.OTP_SUCCESS_MESSAGE.toString(),
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
    //resendOtp,
  },
};
