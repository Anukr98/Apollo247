import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { LOGIN_TYPE, LoginOtp, OTP_STATUS } from 'profiles-service/entities';
import { archiveOtpRecord } from 'profiles-service/resolvers/login';
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
  const apiCallId = Math.floor(Math.random() * 10000);
  debugLog('otpVerificationAPILogger', 'API_CALL___START', 'verifyLoginOtp_API_' + apiCallId);
  //otp verification logic here
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  debugLog('otpVerificationAPILogger', 'QUERY_START', 'verifyLoginOtp_API_' + apiCallId);
  const matchedOtpRow: LoginOtp[] = await otpRepo.verifyOtp(otpVerificationInput);
  debugLog('otpVerificationAPILogger', 'QUERY_END', 'verifyLoginOtp_API_' + apiCallId);
  if (matchedOtpRow.length === 0) {
    debugLog(
      'otpVerificationAPILogger',
      'VALIDATION_FAILED_API_CALL___END',
      'verifyLoginOtp_API_' + apiCallId
    );
    return {
      status: false,
      reason: OTP_STATUS.NOT_VERIFIED,
      authToken: null,
      isBlocked: false,
      incorrectAttempts: 0,
    };
  }

  debugLog('otpVerificationAPILogger', 'VALIDATION_START', 'verifyLoginOtp_API_' + apiCallId);

  if (matchedOtpRow[0].status === OTP_STATUS.BLOCKED) {
    debugLog(
      'otpVerificationAPILogger',
      'VALIDATION_FAILED_API_CALL___END',
      'verifyLoginOtp_API_' + apiCallId
    );
    return {
      status: false,
      reason: matchedOtpRow[0].status,
      authToken: null,
      isBlocked: true,
      incorrectAttempts: matchedOtpRow[0].incorrectAttempts,
    };
  }

  if (matchedOtpRow[0].otp != otpVerificationInput.otp) {
    const incorrectAttempts = matchedOtpRow[0].incorrectAttempts + 1;
    const updateAttrs = {
      incorrectAttempts,
      status: OTP_STATUS.NOT_VERIFIED,
    };
    if (incorrectAttempts > 2) updateAttrs.status = OTP_STATUS.BLOCKED;
    await otpRepo.updateOtpStatus(matchedOtpRow[0].id, updateAttrs);
    debugLog(
      'otpVerificationAPILogger',
      'VALIDATION_FAILED_API_CALL___END',
      'verifyLoginOtp_API_' + apiCallId
    );
    return {
      status: false,
      reason: matchedOtpRow[0].status,
      authToken: null,
      isBlocked: updateAttrs.status === OTP_STATUS.BLOCKED ? true : false,
      incorrectAttempts: matchedOtpRow[0].incorrectAttempts + 1,
    };
  }

  debugLog('otpVerificationAPILogger', 'VALIDATION_END', 'verifyLoginOtp_API_' + apiCallId);

  debugLog('otpVerificationAPILogger', 'UPDATION_START', 'verifyLoginOtp_API_' + apiCallId);

  //update status of otp
  await otpRepo.updateOtpStatus(matchedOtpRow[0].id, {
    status: OTP_STATUS.VERIFIED,
  });

  //archive the old otp record and then delete it
  archiveOtpRecord(matchedOtpRow[0].id, profilesDb);
  debugLog('otpVerificationAPILogger', 'UPDATION_END', 'verifyLoginOtp_API_' + apiCallId);

  //generate customToken
  debugLog('otpVerificationAPILogger', 'CREATE_TOKEN_START', 'verifyLoginOtp_API_' + apiCallId);
  const customToken = await firebase.auth().createCustomToken(matchedOtpRow[0].mobileNumber);
  debugLog('otpVerificationAPILogger', 'CREATE_TOKEN_END', 'verifyLoginOtp_API_' + apiCallId);

  debugLog('otpVerificationAPILogger', 'API_CALL___END', 'verifyLoginOtp_API_' + apiCallId);

  return {
    status: true,
    reason: matchedOtpRow[0].status,
    authToken: customToken,
    isBlocked: false,
    incorrectAttempts: matchedOtpRow[0].incorrectAttempts,
  };
};

export const verifyLoginOtpResolvers = {
  Query: {
    verifyLoginOtp,
  },
};
