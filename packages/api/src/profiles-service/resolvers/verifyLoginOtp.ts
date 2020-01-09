import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { LoginOtp, LOGIN_TYPE, OTP_STATUS } from 'profiles-service/entities';
import { LoginOtpRepository } from 'profiles-service/repositories/loginOtpRepository';
import * as firebaseAdmin from 'firebase-admin';

const firebase = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

export const verifyLoginOtpTypeDefs = gql`
  type OtpVerificationResult {
    status: Boolean!
    authToken: String
    isBlocked: Boolean
  }

  input OtpVerificationInput {
    mobileNumber: String!
    otp: String!
    loginType: LOGIN_TYPE!
  }

  extend type Query {
    verifyLoginOtp(otpVerificationInput: OtpVerificationInput): OtpVerificationResult!
  }
`;
type OtpVerificationInput = {
  mobileNumber: string;
  otp: string;
  loginType: LOGIN_TYPE;
};

type OtpVerificationInputArgs = { otpVerificationInput: OtpVerificationInput };

type OtpVerificationResult = {
  status: Boolean;
  authToken: string | null;
  isBlocked: Boolean;
};

const verifyLoginOtp: Resolver<
  null,
  OtpVerificationInputArgs,
  ProfilesServiceContext,
  OtpVerificationResult
> = async (parent, { otpVerificationInput }, { profilesDb }) => {
  //otp verification logic here
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);
  const matchedOtpRow: LoginOtp[] = await otpRepo.verifyOtp(otpVerificationInput);
  if (matchedOtpRow.length === 0) {
    return { status: false, authToken: null, isBlocked: false };
  }

  if (matchedOtpRow[0].status === OTP_STATUS.BLOCKED) {
    return { status: false, authToken: null, isBlocked: true };
  }

  if (matchedOtpRow[0].otp != otpVerificationInput.otp) {
    const incorrectAttempts = matchedOtpRow[0].incorrectAttempts + 1;
    const updateAttrs = {
      incorrectAttempts,
      status: OTP_STATUS.NOT_VERIFIED,
    };
    if (incorrectAttempts > 2) updateAttrs.status = OTP_STATUS.BLOCKED;
    await otpRepo.updateOtpStatus(matchedOtpRow[0].id, updateAttrs);
    return {
      status: false,
      authToken: null,
      isBlocked: updateAttrs.status === OTP_STATUS.BLOCKED ? true : false,
    };
  }

  //update status of otp
  await otpRepo.updateOtpStatus(matchedOtpRow[0].id, { status: OTP_STATUS.VERIFIED });

  //generate customeToken
  const customToken = await firebase.auth().createCustomToken(otpVerificationInput.mobileNumber);

  return { status: true, authToken: customToken, isBlocked: false };
};

export const verifyLoginOtpResolvers = {
  Query: {
    verifyLoginOtp,
  },
};
