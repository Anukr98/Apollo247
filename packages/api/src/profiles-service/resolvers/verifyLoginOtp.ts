import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { LOGIN_TYPE, LoginOtp, OTP_STATUS } from 'profiles-service/entities';
import { LoginOtpRepository } from 'profiles-service/repositories/loginOtpRepository';
import * as firebaseAdmin from 'firebase-admin';
import { debugLog } from 'customWinstonLogger';

const firebase = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

export const verifyLoginOtpTypeDefs = gql`
  type OtpVerificationResult {
    status: Boolean!
    reason: OTP_STATUS
    authToken: String
    isBlocked: Boolean
    incorrectAttempts: Int
  }

  input OtpVerificationInput {
    id: String!
    otp: String!
    loginType: LOGIN_TYPE!
  }

  extend type Query {
    verifyLoginOtp(otpVerificationInput: OtpVerificationInput): OtpVerificationResult!
  }
`;
type OtpVerificationInput = {
  id: string;
  otp: string;
  loginType: LOGIN_TYPE;
};

type OtpVerificationInputArgs = { otpVerificationInput: OtpVerificationInput };

type OtpVerificationResult = {
  status: Boolean;
  reason: string;
  authToken: string | null;
  isBlocked: Boolean;
  incorrectAttempts: number;
};

const verifyLoginOtp: Resolver<
  null,
  OtpVerificationInputArgs,
  ProfilesServiceContext,
  OtpVerificationResult
> = async (parent, { otpVerificationInput }, { profilesDb }) => {
  const apiCallId = Math.floor(Math.random() * 1000000);
  //API_CALL___START
  const callStartTime = new Date();
  //create first order curried method with first 3 static parameters being passed.
  const verifyLogger = debugLog('otpVerificationAPILogger', 'verifyLoginOtp', apiCallId);

  //otp verification logic here
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  // QUERY_START
  let reqStartTime = new Date();
  const matchedOtpRes: LoginOtp = await otpRepo.verifyOtp(otpVerificationInput);
  verifyLogger(reqStartTime, otpVerificationInput.id, 'QUERY_END');

  if (!matchedOtpRes) {
    verifyLogger(callStartTime, otpVerificationInput.id, 'VALIDATION_FAILED_API_CALL___END');
    return {
      status: false,
      reason: OTP_STATUS.NOT_VERIFIED,
      authToken: null,
      isBlocked: false,
      incorrectAttempts: 0,
    };
  }

  // VALIDATION_START
  reqStartTime = new Date();
  if (matchedOtpRes.status === OTP_STATUS.BLOCKED) {
    verifyLogger(callStartTime, matchedOtpRes.mobileNumber, 'VALIDATION_FAILED_API_CALL___END');
    return {
      status: false,
      reason: matchedOtpRes.status,
      authToken: null,
      isBlocked: true,
      incorrectAttempts: matchedOtpRes.incorrectAttempts,
    };
  }

  if (matchedOtpRes.otp != otpVerificationInput.otp) {
    const incorrectAttempts = matchedOtpRes.incorrectAttempts + 1;
    const updateAttrs = {
      ...matchedOtpRes,
      ...{
        incorrectAttempts,
        status: OTP_STATUS.NOT_VERIFIED,
      },
    };
    if (incorrectAttempts > 2) updateAttrs.status = OTP_STATUS.BLOCKED;
    await otpRepo.updateOtpStatus(matchedOtpRes.id, updateAttrs);

    verifyLogger(callStartTime, matchedOtpRes.mobileNumber, 'VALIDATION_FAILED_API_CALL___END');
    return {
      status: false,
      reason: matchedOtpRes.status,
      authToken: null,
      isBlocked: updateAttrs.status === OTP_STATUS.BLOCKED ? true : false,
      incorrectAttempts: matchedOtpRes.incorrectAttempts + 1,
    };
  }
  verifyLogger(reqStartTime, matchedOtpRes.mobileNumber, 'VALIDATION_END');

  //UPDATION_START
  reqStartTime = new Date();
  //update status of otp
  await otpRepo.updateOtpStatus(matchedOtpRes.id, {
    ...matchedOtpRes,
    ...{
      status: OTP_STATUS.VERIFIED,
    },
  });

  verifyLogger(reqStartTime, matchedOtpRes.mobileNumber, 'UPDATION_END');

  //CREATE_TOKEN_START
  reqStartTime = new Date();
  //generate customToken
  const customToken = await firebase.auth().createCustomToken(matchedOtpRes.mobileNumber);
  verifyLogger(reqStartTime, matchedOtpRes.mobileNumber, 'CREATE_TOKEN_END');

  verifyLogger(callStartTime, matchedOtpRes.mobileNumber, 'API_CALL___END');
  return {
    status: true,
    reason: matchedOtpRes.status,
    authToken: customToken,
    isBlocked: false,
    incorrectAttempts: matchedOtpRes.incorrectAttempts,
  };
};

export const verifyLoginOtpResolvers = {
  Query: {
    verifyLoginOtp,
  },
};
