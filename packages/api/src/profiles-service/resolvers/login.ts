import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { LoginOtp, LOGIN_TYPE, OTP_STATUS } from 'profiles-service/entities';
import { LoginOtpRepository } from 'profiles-service/repositories/loginOtpRepository';

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
    message: String
  }

  extend type Query {
    login(mobileNumber: String!, loginType: LOGIN_TYPE!): LoginResult!
  }
`;

type LoginResult = {
  status: Boolean;
  message: string;
};

const login: Resolver<
  null,
  { mobileNumber: string; loginType: LOGIN_TYPE },
  ProfilesServiceContext,
  LoginResult
> = async (parent, args, { profilesDb }) => {
  const otpRepo = profilesDb.getCustomRepository(LoginOtpRepository);
  const randomNumber = generateOTP();

  //call sms gateway service to send the OTP here

  const optAttrs: Partial<LoginOtp> = {
    loginType: args.loginType,
    mobileNumber: args.mobileNumber,
    otp: randomNumber,
    status: OTP_STATUS.NOT_VERIFIED,
  };

  const otpSaveResponse = await otpRepo.insertOtp(optAttrs);

  return { status: true, message: 'OTP sent to the mobile number successfully' };
};

//returns random 4 digit number string
export const generateOTP = () => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

export const loginResolvers = {
  Query: {
    login,
  },
};
