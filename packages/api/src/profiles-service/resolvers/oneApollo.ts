import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { OneApollo } from 'helpers/oneApollo';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

import { ONE_APOLLO_STORE_CODE } from 'types/oneApolloTypes';

export const oneApolloTypeDefs = gql`
  type UserDetailResponse {
    name: String
    earnedHC: Float!
    availableHC: Float!
    tier: String!
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
`;

type UserDetailResponse = {
  name: string | null;
  earnedHC: number;
  availableHC: number;
  tier: string;
};

type TransactionDetails = {
  businessUnit: string;
  earnedHC: number;
  redeemedHC: number;
  transactionDate: Date;
  netAmount: number;
  grossAmount: number;
};

const getOneApolloUser: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  UserDetailResponse
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const mobNumberIN = mobileNumber.slice(3);

  const oneApollo = new OneApollo();
  let response = await oneApollo.getOneApolloUser(mobNumberIN);
  if (!response.Success) {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient = await patientRepo.getPatientDetails(args.patientId);

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
        CustomerId: patient.uhid,
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

const getOneApolloUserTransactions: Resolver<
  null,
  {},
  ProfilesServiceContext,
  TransactionDetails[]
> = async (parent, args, { mobileNumber }) => {
  const mobNumberIN = mobileNumber.slice(3);
  const oneApollo = new OneApollo();

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
};
