import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import {
  customerIdentification,
  generateOtp,
  verifyOtp,
  fetchEthnicCode,
} from 'profiles-service/helpers/hdfc';
import { getCache } from 'profiles-service/database/connectRedis';
import { PartnerId } from 'ApiConstants';

export const validateHDFCCustomerTypeDefs = gql`
  enum HDFC_CUSTOMER {
    NOT_HDFC_CUSTOMER
    OTP_GENERATED
    OTP_NOT_GENERATED
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
    validateHdfcOTP(otp: String!, token: String!, dateOfBirth: Date!): validHdfcCustomerResponse
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
const MOCK_KEY = 'mock:hdfc';
const identifyHdfcCustomer: Resolver<
  null,
  { mobileNumber: string; DOB: Date },
  ProfilesServiceContext,
  identifyHdfcCustomerResponse
> = async (parent, args, { profilesDb }) => {
  const mock_api = await getCache(MOCK_KEY);
  if (mock_api && mock_api === 'true') {
    //mock api
    const { mobileNumber, DOB } = args;
    const isHDFC = checkForRegisteredPartner(mobileNumber, DOB, PartnerId.HDFCBANK);
    if (!isHDFC) {
      return { status: HDFC_CUSTOMER.NOT_HDFC_CUSTOMER };
    }
    const token = 'DummyToken';
    return { status: HDFC_CUSTOMER.OTP_GENERATED, token };
  } else {
    //real api
    const isHDFC =
      (await customerIdentification(args.mobileNumber, args.DOB))?.decryptedResponse
        ?.customerCASADetailsDTO?.existingCustomer === 'Y';
    if (isHDFC) {
      return { status: HDFC_CUSTOMER.NOT_HDFC_CUSTOMER };
    }
    const otpGenerationResponse = await generateOtp(args.mobileNumber);
    if (otpGenerationResponse?.decryptedResponse?.ccotpserviceResponse?.ERROR_CODE === '0000') {
      return { status: HDFC_CUSTOMER.OTP_GENERATED, token: args.mobileNumber };
    } else {
      return { status: HDFC_CUSTOMER.OTP_NOT_GENERATED };
    }
  }
};

const validateHdfcOTP: Resolver<
  null,
  { otp: string; token: string; dateOfBirth: Date },
  ProfilesServiceContext,
  validHdfcCustomerResponse
> = async (parent, args, { profilesDb }) => {
  const mock_api = await getCache(MOCK_KEY);
  if (mock_api && mock_api === 'true') {
    //mock api

    const { otp, token } = args;

    const otpAttrs = { otp, token };
    return { status: validateOTP(otpAttrs), defaultPlan: 'HDFCGold' };
  } else {
    const verifyOtpResponse = await verifyOtp(args.otp, args.token);
    if (
      verifyOtpResponse.decryptedResponse?.verifyPwdRequestResponse?.multiRef?.statusCode === '00'
    ) {
      const fetchEthnicCodeResponse = await fetchEthnicCode(
        args.dateOfBirth,
        args.token,
        verifyOtpResponse.historyToken
      );

      const planName: string = fetchEthnicCodeResponse.decryptedResponse?.customerCASADetailsDTO
        ? defaultPlan(fetchEthnicCodeResponse.decryptedResponse.customerCASADetailsDTO)
        : '';
      return { status: true, defaultPlan: planName };
    }
    return { status: false, defaultPlan: '' };
  }
};

const plan_map: { [index: string]: { hdfcCustomerType: string; plan: string; rank: number } } = {
  '7': { hdfcCustomerType: '', plan: 'HDFCPlatinum', rank: 3 },
  H: { hdfcCustomerType: '', plan: 'HDFCPlatinum', rank: 3 },
  U: { hdfcCustomerType: '', plan: 'HDFCPlatinum', rank: 3 },
  '18': { hdfcCustomerType: '', plan: 'HDFCPlatinum', rank: 3 },
  '2': { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  W: { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  '20': { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  '8': { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  O: { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  S: { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  '4': { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  '19': { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  F: { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  E: { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  R: { hdfcCustomerType: '', plan: 'HDFCGold', rank: 2 },
  '0': { hdfcCustomerType: '', plan: 'HDFCSilver', rank: 1 },
  '9': { hdfcCustomerType: '', plan: 'HDFCSilver', rank: 1 },
  '26': { hdfcCustomerType: '', plan: 'HDFCSilver', rank: 1 },
};
function defaultPlan(params: { [index: string]: string | number }[]): string {
  let matchingPlan: { hdfcCustomerType: string; plan: string; rank: number } | null = null;
  let current_rank = 0;
  for (let index = 0; index < params.length; index++) {
    if (current_rank < plan_map[params[index]['ethnicCode']].rank) {
      current_rank = plan_map[params[index]['ethnicCode']].rank;
      matchingPlan = plan_map[params[index]['ethnicCode']];
    }
  }
  return matchingPlan ? matchingPlan.plan : 'HDFCSilver';
}
export const validateHDFCCustomer = {
  Query: {
    identifyHdfcCustomer,
    validateHdfcOTP,
  },
};

export const checkForRegisteredPartner = function(
  mobileNumber: string,
  dob: Date,
  partnerId: string
) {
  // for hdfc
  if (partnerId == PartnerId.HDFCBANK && parseInt(mobileNumber, 10) % 2 == 0) {
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
