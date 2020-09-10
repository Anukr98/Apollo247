import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { OneApollo } from 'helpers/oneApollo';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format } from 'date-fns';
import { ONE_APOLLO_STORE_CODE } from 'types/oneApolloTypes';
import { Patient } from 'profiles-service/entities';

export const oneApolloTypeDefs = gql`
  type UserDetailResponse {
    name: String
    earnedHC: Float!
    availableHC: Float!
    tier: String!
    burnedCredits: Float!
    blockedCredits: Float
  }

  type TransactionDetails {
    businessUnit: String!
    earnedHC: Float!
    redeemedHC: Float!
    transactionDate: String!
    netAmount: Float!
    grossAmount: Float!
  }

  type CreateOneApolloUserResult {
    success: Boolean
    message: String
    referenceNumber: String
  }

  extend type Mutation {
    createOneApolloUser(patientId: String!): CreateOneApolloUserResult
  }

  extend type Query {
    getOneApolloUser(patientId: String): UserDetailResponse
    getOneApolloUserTransactions: [TransactionDetails]
  }
`;

type CreateOneApolloUserResult = {
  message: string;
  success: boolean;
  referenceNumber: string;
};

type UserDetailResponse = {
  name: string | null;
  earnedHC: number;
  availableHC: number;
  tier: string;
  burnedCredits: number;
  blockedCredits: number;
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
      const userCreateResponse = await oneApollo.createOneApolloUser({
        FirstName: patient.firstName,
        LastName: patient.lastName,
        BusinessUnit: <string>process.env.ONEAPOLLO_BUSINESS_UNIT,
        MobileNumber: mobNumberIN,
        Gender: patient.gender,
        StoreCode: getStoreCode(patient),
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
  const userData = response.CustomerData;
  const individualData = userData.Individual;
  return {
    name: userData.Name,
    earnedHC: individualData ? individualData.EarnedCredits : userData.EarnedCredits,
    availableHC: userData.AvailableCredits,
    tier: individualData ? individualData.Tier : userData.Tier,
    burnedCredits: individualData ? individualData.BurnedCredits : userData.BurnedCredits,
    blockedCredits: individualData ? individualData.BlockedCredits : userData.BlockedCredits,
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

const createOneApolloUser: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  CreateOneApolloUserResult
> = async (parent, { patientId }, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const oneApollo = new OneApollo();
  if (!patientId) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  //check patient in apollo247
  const patient = await patientRepo.getPatientDetails(patientId);
  if (patient) {
    let mobileNumber = '';
    if (patient.mobileNumber.length === 13) {
      mobileNumber = patient.mobileNumber.slice(3);
    } else {
      mobileNumber = patient.mobileNumber;
    }
    const userCreateResponse = await oneApollo.createOneApolloUser({
      FirstName: patient.firstName,
      LastName: patient.lastName,
      BusinessUnit: <string>process.env.ONEAPOLLO_BUSINESS_UNIT,
      MobileNumber: mobileNumber,
      DOB: format(patient.dateOfBirth, 'yyyy-MM-dd'),
      Gender: patient.gender,
      Email: patient.emailAddress,
      StoreCode: getStoreCode(patient),
      CustomerId: patient.uhid,
    });

    if (userCreateResponse.Success) {
      return {
        success: userCreateResponse.Success,
        message: userCreateResponse.Message,
        referenceNumber: userCreateResponse.ReferenceNumber,
      };
    } else {
      throw new AphError(userCreateResponse.Message, undefined, {});
    }
  } else {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
};

/**
 * helper fn
 */
const getStoreCode = (patient: Patient) => {
  let storeCode: ONE_APOLLO_STORE_CODE = ONE_APOLLO_STORE_CODE.WEBCUS;
  if (patient.iosVersion) {
    storeCode = ONE_APOLLO_STORE_CODE.IOSCUS;
  }
  if (patient.androidVersion) {
    storeCode = ONE_APOLLO_STORE_CODE.ANDCUS;
  }
  return storeCode;
};
/**
 * expose one apollo resolvers
 */
export const oneApolloResolvers = {
  Query: {
    getOneApolloUser,
    getOneApolloUserTransactions,
  },
  Mutation: {
    createOneApolloUser,
  },
};
