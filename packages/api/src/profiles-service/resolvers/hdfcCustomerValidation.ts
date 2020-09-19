import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';

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
    identifyHdfcCustomer(mobileNumber: String!, DOB: String!): identifyHdfcCustomerResponse
    validateHdfcOTP(otp: String!, token: String!): validHdfcCustomerResponse
  }
`;

enum HDFC_CUSTOMER {
  NOT_HDFC_CUSTOMER = 'NOT_HDFC_CUSTOMER',
  OTP_GENERATED = 'OTP_GENERATED',
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
  { mobileNumber: string; DOB: string },
  ProfilesServiceContext,
  identifyHdfcCustomerResponse
> = async (parent, args, { profilesDb }) => {
  const { mobileNumber } = args;
  const isHDFC = checkFromHDFC(mobileNumber);
  if (!isHDFC) {
    return { status: HDFC_CUSTOMER.NOT_HDFC_CUSTOMER };
  }
  // generate OTP
  // append to token
  const token = 'DummyToken';
  return { status: HDFC_CUSTOMER.OTP_GENERATED, token };
};

const validateHdfcOTP: Resolver<
  null,
  { otp: string; token: string },
  ProfilesServiceContext,
  validHdfcCustomerResponse
> = async (parent, args, { profilesDb }) => {
  const { otp, token } = args;

  const otpAttrs = { otp, token };
  return { status: validateOTP(otpAttrs), defaultPlan: 'HDFCGold' };
};

export const validateHDFCCustomer = {
  Query: {
    identifyHdfcCustomer,
    validateHdfcOTP,
  },
};

const checkFromHDFC = function(mobileNumber: string) {
  if (parseInt(mobileNumber, 10) % 2 == 0) {
    return true;
  }
  return false;
};

// const generateOTP = function() {
//   return '123456';
// };

const validateOTP = function(otpAttrs: any) {
  const { otp, token } = otpAttrs;
  return token == 'DummyToken' && otp == '123456' ? true : false;
};
