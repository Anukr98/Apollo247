import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import {
  CustomerIdentification,
  generateOtp,
  verifyOtp,
} from 'profiles-service/helpers/external_partner/hdfc';

export const validateHDFCCustomerTypeDefs = gql`
  enum HDFC_CUSTOMER {
    NOT_HDFC_CUSTOMER
    OTP_GENERATED
  }
  type identifyHdfcCustomerResponse {
    status: HDFC_CUSTOMER!
    token: String
  }
  type validHdfcCustomerResponse {
    status: Boolean
    defaultPlan: String
  }
  extend type Query {
    identifyHdfcCustomer(mobileNumber: String!, DOB: Date!): identifyHdfcCustomerResponse
    validateHdfcOTP(otp: String!, token: String!): validHdfcCustomerResponse
  }
`;

enum HDFC_CUSTOMER {
  NOT_HDFC_CUSTOMER = 'NOT_HDFC_CUSTOMER',
  OTP_GENERATED = 'OTP_GENERATED',
  OTP_NOT_GENERATED = 'OTP_NOT_GENERATED',
}
type identifyHdfcCustomerResponse = {
  status: HDFC_CUSTOMER;
  token?: string;
};

type validHdfcCustomerResponse = {
  status: boolean;
  defaultPlan: string;
};
const identifyHdfcCustomer: Resolver<
  null,
  { mobileNumber: string; DOB: Date },
  ProfilesServiceContext,
  identifyHdfcCustomerResponse
> = async (parent, args, { profilesDb }) => {
  const isHDFC = (await CustomerIdentification(args.mobileNumber, args.DOB))['decryptedResponse'][
    'customerCASADetailsDTO'
  ]['existingCustomer'];
  if (isHDFC !== 'Y') {
    return { status: HDFC_CUSTOMER.NOT_HDFC_CUSTOMER };
  }
  const otpGenerationResponse = await generateOtp(args.mobileNumber);
  if (
    otpGenerationResponse &&
    otpGenerationResponse['decryptedResponse'] &&
    otpGenerationResponse['decryptedResponse']['ccotpserviceResponse'] &&
    otpGenerationResponse['decryptedResponse']['ccotpserviceResponse']['ERROR_CODE'] === '0000'
  ) {
    return { status: HDFC_CUSTOMER.OTP_GENERATED, token: args.mobileNumber };
  } else {
    return { status: HDFC_CUSTOMER.OTP_NOT_GENERATED };
  }
};

const validateHdfcOTP: Resolver<
  null,
  { otp: string; token: string },
  ProfilesServiceContext,
  validHdfcCustomerResponse
> = async (parent, args, { profilesDb }) => {
  const { otp, token } = args;
  const verifyOtpResponse = await verifyOtp(otp, token);
  if (
    verifyOtpResponse['decryptedResponse'] &&
    verifyOtpResponse['decryptedResponse']['verifyPwdRequestResponse'] &&
    verifyOtpResponse['decryptedResponse']['verifyPwdRequestResponse']['multiRef'] &&
    verifyOtpResponse['decryptedResponse']['verifyPwdRequestResponse']['multiRef']['statusCode'] ===
      '00'
  ) {
    // need to add call for fetchEthnicCode
    return { status: true, defaultPlan: 'HDFCGold' };
  } else {
    return { status: false, defaultPlan: '' };
  }
};

export const validateHDFCCustomer = {
  Query: {
    identifyHdfcCustomer,
    validateHdfcOTP,
  },
};

// const checkFromHDFC = function(mobileNumber: string) {
//   if (parseInt(mobileNumber, 10) % 2 == 0) {
//     return true;
//   }
//   return false;
// };

// const generateOTP = function() {
//   return '123456';
// };

// const validateOTP = function(otpAttrs: any) {
//   const { otp, token } = otpAttrs;
//   return token == 'DummyToken' && otp == '123456' ? true : false;
// };
