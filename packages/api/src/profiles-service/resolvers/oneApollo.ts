import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { BlockOneApolloPointsRequest, BlockUserPointsResponse } from 'types/oneApolloTypes';
import { OneApollo } from 'profiles-service/repositories/ExternalRequests';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  ONE_APOLLO_STORE_CODE,
  DEVICE_TYPE,
  MEDICINE_ORDER_PAYMENT_TYPE,
} from 'profiles-service/entities';
import { log } from 'customWinstonLogger';

export const oneApolloTypeDefs = gql`
  type UserDetailResponse {
    name: String!
    earnedHC: Float!
    availableHC: Float!
    tier: String!
  }

  input BlockUserPointsRequest {
    mobileNumber: String!
    deviceType: DEVICE_TYPE!
    creditsToBlock: Float!
    orderId: Int!
    id: String!
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE
  }

  type BlockUserPointsResponse {
    Success: Boolean!
    Message: String!
    RequestNumber: String
    AvailablePoints: Float
    BalancePoints: Float
    RedeemedPoints: Float
    PointsValue: Float
  }
  type TransactionDetails {
    businessUnit: String!
    earnedHC: Float!
    redeemedHC: Float!
    transactionDate: String!
    netAmount: Float!
    grossAmount: Float!
  }

  extend type Query {
    getOneApolloUser(patientId: String): UserDetailResponse
    getOneApolloUserTransactions: [TransactionDetails]
  }
  extend type Mutation {
    blockOneApolloUserPoints(userDetailInput: BlockUserPointsRequest): BlockUserPointsResponse
  }
`;

type UserDetailResponse = {
  name: string;
  earnedHC: number;
  availableHC: number;
  tier: string;
};

type BlockUserPointsRequest = {
  userDetailInput: {
    mobileNumber: string;
    deviceType: DEVICE_TYPE | DEVICE_TYPE.ANDROID;
    creditsToBlock: number;
    orderId: number;
    id: string;
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  };
};
type TransactionDetails = {
  businessUnit: string;
  earnedHC: number;
  redeemedHC: number;
  transactionDate: Date;
  netAmount: number;
  grossAmount: number;
};

const oneApollo = new OneApollo();

const getOneApolloUser: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  UserDetailResponse
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const mobNumberIN = mobileNumber.slice(3);

  let response = await oneApollo.getOneApolloUser(mobNumberIN);
  if (!response.Success) {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient = await patientRepo.findById(args.patientId);
    if (patient) {
      let storeCode: ONE_APOLLO_STORE_CODE = ONE_APOLLO_STORE_CODE.WEBCUS;
      if (patient.iosVersion) {
        storeCode = ONE_APOLLO_STORE_CODE.IOSCUS;
      }
      if (patient.androidVersion) {
        storeCode = ONE_APOLLO_STORE_CODE.ANDCUS;
      }
      const userCreateResponse = await oneApollo.createOneApolloUser({
        FirstName: patient.firstName,
        LastName: patient.lastName,
        BusinessUnit: <string>process.env.ONEAPOLLO_BUSINESS_UNIT,
        MobileNumber: mobNumberIN,
        Gender: patient.gender,
        StoreCode: storeCode,
      });
      if (userCreateResponse.Success) {
        response = await oneApollo.getOneApolloUser(mobNumberIN);
        if (!response.Success) {
          throw new AphError(response.Message, undefined, {});
        }
      } else {
        throw new AphError(userCreateResponse.Message, undefined, {});
      }
    } else {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }
  }
  return {
    name: response.CustomerData.Name,
    earnedHC: response.CustomerData.EarnedCredits,
    availableHC: response.CustomerData.AvailableCredits,
    tier: response.CustomerData.Tier,
  };
};

const blockOneApolloUserPoints: Resolver<
  null,
  BlockUserPointsRequest,
  ProfilesServiceContext,
  Partial<BlockUserPointsResponse>
> = async (parent, { userDetailInput }, { profilesDb }) => {
  console.log(userDetailInput);
  let storeCode = ONE_APOLLO_STORE_CODE.WEBCUS;
  switch (userDetailInput.deviceType) {
    case DEVICE_TYPE.ANDROID:
      storeCode = ONE_APOLLO_STORE_CODE.ANDCUS;
      break;
    case DEVICE_TYPE.IOS:
      storeCode = ONE_APOLLO_STORE_CODE.IOSCUS;
      break;
  }
  const blockUserPointsInput: BlockOneApolloPointsRequest = {
    MobileNumber: +userDetailInput.mobileNumber.slice(3),
    CreditsRedeemed: userDetailInput.creditsToBlock,
    StoreCode: storeCode,
    BusinessUnit: process.env.ONEAPOLLO_BUSINESS_UNIT || '',
  };
  const response: Partial<BlockUserPointsResponse> = await oneApollo.blockOneUserCredits(
    blockUserPointsInput
  );
  if (!response.Success) {
    log(
      'profileServiceLogger',
      `Redemption request failed - ${userDetailInput.orderId}`,
      'blockUserPoints()',
      JSON.stringify(response),
      'true'
    );
    return response;
  } else {
    const medRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
    await medRepo.saveMedicineOrderPayment({
      medicineOrders: {
        orderAutoId: userDetailInput.orderId,
        id: userDetailInput.id,
      },
      healthCreditsRedemptionRequest: response,
      paymentType: userDetailInput.paymentType,
    });
    return response;
  }
};

const getOneApolloUserTransactions: Resolver<
  null,
  {},
  ProfilesServiceContext,
  TransactionDetails[]
> = async (parent, args, { mobileNumber }) => {
  const mobNumberIN = mobileNumber.slice(3);

  const response = await oneApollo.getOneApolloUserTransactions(mobNumberIN);
  if (!response.Success) {
    throw new AphError(response.Message, undefined, {});
  } else {
    const transactions: TransactionDetails[] = [];
    response.TransactionData.forEach(
      (val: {
        BusinessUnit: string;
        Earned_Health_Credits: number;
        Health_Credits_Redeemed: number;
        TransactionDate: Date;
        NetAmount: number;
        GrossAmount: number;
      }) => {
        transactions.push({
          businessUnit: val.BusinessUnit,
          earnedHC: val.Earned_Health_Credits,
          redeemedHC: val.Health_Credits_Redeemed,
          transactionDate: val.TransactionDate,
          netAmount: +val.NetAmount.toFixed(2),
          grossAmount: +val.GrossAmount.toFixed(2),
        });
      }
    );
    return transactions;
  }
};

export const oneApolloResolvers = {
  Query: {
    getOneApolloUser,
    getOneApolloUserTransactions,
  },
  Mutation: {
    blockOneApolloUserPoints,
  },
};
