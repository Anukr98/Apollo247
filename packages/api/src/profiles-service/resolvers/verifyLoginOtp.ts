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
  const apiCallId = Math.floor(Math.random() * 1000000);
  const callStartTime = new Date();
  //create first order curried method with first 3 static parameters being passed.
  const verifyLogger = debugLog(
    'otpVerificationAPILogger',
    'verifyLoginOtp',
    apiCallId,
    callStartTime
  );

  //create second order curried method with loginId as identifier till mobileNumber is received
  const verifyByIdLogger = verifyLogger(otpVerificationInput.id);

  verifyByIdLogger('API_CALL___START');

  //otp verification logic here
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);

  verifyByIdLogger('QUERY_START');
  const matchedOtpRow: LoginOtp[] = await otpRepo.verifyOtp(otpVerificationInput);
  verifyByIdLogger('QUERY_END');

  if (matchedOtpRow.length === 0) {
    verifyByIdLogger('VALIDATION_FAILED_API_CALL___END');
    return {
      status: false,
      reason: OTP_STATUS.NOT_VERIFIED,
      authToken: null,
      isBlocked: false,
      incorrectAttempts: 0,
    };
  }

  //create second order curried method with mobileNumber as identifier
  const verifyByMobileNumLogger = verifyLogger(matchedOtpRow[0].mobileNumber);

  verifyByMobileNumLogger('VALIDATION_START');
  if (matchedOtpRow[0].status === OTP_STATUS.BLOCKED) {
    verifyByMobileNumLogger('VALIDATION_FAILED_API_CALL___END');
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
    verifyByMobileNumLogger('VALIDATION_FAILED_API_CALL___END');
    return {
      status: false,
      reason: matchedOtpRow[0].status,
      authToken: null,
      isBlocked: updateAttrs.status === OTP_STATUS.BLOCKED ? true : false,
      incorrectAttempts: matchedOtpRow[0].incorrectAttempts + 1,
    };
  }
  verifyByMobileNumLogger('VALIDATION_END');

  verifyByMobileNumLogger('UPDATION_START');
  //update status of otp
  await otpRepo.updateOtpStatus(matchedOtpRow[0].id, {
    status: OTP_STATUS.VERIFIED,
  });

  //archive the old otp record and then delete it
  archiveOtpRecord(matchedOtpRow[0].id, profilesDb);
  verifyByMobileNumLogger('UPDATION_END');

  //generate customToken
  verifyByMobileNumLogger('CREATE_TOKEN_START');
  const customToken = await firebase.auth().createCustomToken(matchedOtpRow[0].mobileNumber);
  verifyByMobileNumLogger('CREATE_TOKEN_END');

  verifyByMobileNumLogger('API_CALL___END');
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
