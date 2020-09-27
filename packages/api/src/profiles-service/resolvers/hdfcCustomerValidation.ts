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
import { debugLog } from 'customWinstonLogger';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Patient } from 'profiles-service/entities';
const dLogger = debugLog(
  'DoctorServiceLogger',
  'RedisConnect',
  Math.floor(Math.random() * 100000000)
);
export const validateHDFCCustomerTypeDefs = gql`
  enum HDFC_CUSTOMER {
    NOT_HDFC_CUSTOMER
    OTP_GENERATED
    OTP_NOT_GENERATED
  }
  type identifyHdfcCustomerResponse {
    status: HDFC_CUSTOMER!
    token: String
    responseCode: Number
  }
  type validHdfcCustomerResponse {
    status: Boolean
    defaultPlan: String
    responseCode: Number
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
  responseCode?: Number;
};

type validHdfcCustomerResponse = {
  status: boolean;
  defaultPlan: string;
  responseCode?: Number;
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
      return { status: HDFC_CUSTOMER.NOT_HDFC_CUSTOMER, responseCode: 404 };
    }
    const token = 'DummyToken';
    return { status: HDFC_CUSTOMER.OTP_GENERATED, token };
  } else {
    //real api
    const customerIdentificationResponse = await customerIdentification(
      args.mobileNumber,
      args.DOB
    );
    dLogger(
      new Date(),
      `HDFC decrypted response customerIdentification`,
      `request ${JSON.stringify(args)} response ${JSON.stringify(customerIdentificationResponse)} `
    );
    const isHDFCCustomer: any =
      customerIdentificationResponse.decryptedResponse?.customerCASADetailsDTO?.existingCustomer;

    if (customerIdentification) {
      if (isHDFCCustomer === 'Y') {
        const otpGenerationResponse = await generateOtp(args.mobileNumber);
        dLogger(
          new Date(),
          `HDFC decrypted response generateOtp`,
          `request ${JSON.stringify(args)} response ${JSON.stringify(otpGenerationResponse)} `
        );
        if (
          otpGenerationResponse?.decryptedResponse?.ccotpserviceResponse?.ERROR_CODE === '00000'
        ) {
          return {
            status: HDFC_CUSTOMER.OTP_GENERATED,
            token: args.mobileNumber,
            responseCode: 200,
          };
        } else {
          return { status: HDFC_CUSTOMER.OTP_NOT_GENERATED, responseCode: 503 };
        }
      } else {
        const patientRepo = profilesDb.getCustomRepository(PatientRepository);
        patientRepo.removePartnerId(PartnerId.HDFCBANK, args.mobileNumber);
        return { status: HDFC_CUSTOMER.NOT_HDFC_CUSTOMER, responseCode: 404 };
      }
    } else {
      return { status: HDFC_CUSTOMER.OTP_NOT_GENERATED, responseCode: 503 };
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
    return { status: validateOTP(args), defaultPlan: 'HDFCGold', responseCode: 200 };
  } else {
    const verifyOtpResponse = await verifyOtp(args.otp, args.token);
    dLogger(
      new Date(),
      `HDFC decrypted response verifyOtp`,
      `request ${JSON.stringify(args)} response ${JSON.stringify(verifyOtpResponse)} `
    );
    if (
      verifyOtpResponse.decryptedResponse?.verifyPwdRequestResponse?.multiRef?.statusCode === '00'
    ) {
      const fetchEthnicCodeResponse = await fetchEthnicCode(
        args.dateOfBirth,
        args.token,
        verifyOtpResponse.historyToken
      );
      dLogger(
        new Date(),
        `HDFC decrypted response fetchEthnicCodeResponse`,
        `request ${JSON.stringify(args)} response ${JSON.stringify(fetchEthnicCodeResponse)} `
      );
      const planName: string = fetchEthnicCodeResponse.decryptedResponse?.customerCASADetailsDTO
        ? defaultPlan(fetchEthnicCodeResponse.decryptedResponse.customerCASADetailsDTO)
        : 'HDFCSilver';
      return { status: true, defaultPlan: planName, responseCode: 202 };
    }
    return { status: false, defaultPlan: '', responseCode: 401 };
  }
};

const plan_map: { [index: string]: { hdfcCustomerType: string; plan: string; rank: number } } = {
  '7': { hdfcCustomerType: 'emperia', plan: 'HDFCPlatinum', rank: 3 },
  H: { hdfcCustomerType: 'emperia', plan: 'HDFCPlatinum', rank: 3 },
  U: { hdfcCustomerType: 'emperia', plan: 'HDFCPlatinum', rank: 3 },
  '18': { hdfcCustomerType: 'emperia', plan: 'HDFCPlatinum', rank: 3 },
  '2': { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  W: { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  '20': { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  '8': { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  O: { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  S: { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  '4': { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  '19': { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  F: { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  E: { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  R: { hdfcCustomerType: 'preferred', plan: 'HDFCGold', rank: 2 },
  '0': { hdfcCustomerType: 'basic', plan: 'HDFCSilver', rank: 1 },
  '9': { hdfcCustomerType: 'basic', plan: 'HDFCSilver', rank: 1 },
  '26': { hdfcCustomerType: 'basic', plan: 'HDFCSilver', rank: 1 },
};
function defaultPlan(params: { [index: string]: string | number }[]): string {
  let matchingPlan: { hdfcCustomerType: string; plan: string; rank: number } | null = {
    rank: 1,
    plan: 'HDFCSilver',
    hdfcCustomerType: 'default',
  };
  let current_rank = 0;
  for (let index = 0; index < params.length; index++) {
    const plan: { hdfcCustomerType: string; plan: string; rank: number } =
      plan_map[params[index]['ethnicCode'].toString().trim()] || matchingPlan;
    if (current_rank < plan.rank) {
      current_rank = plan.rank;
      matchingPlan = plan;
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
