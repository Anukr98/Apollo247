import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';

export const getOneApolloUserTransactionsTypeDefs = gql`
  type TransactionDetails {
    businessUnit: String!
    earnedHC: Float!
    redeemedHC: Float!
    transactionDate: String!
    netAmount: Float!
    grossAmount: Float!
  }
  extend type Query {
    getOneApolloUserTransactions: [TransactionDetails]
  }
`;

type TransactionDetails = {
  businessUnit: string;
  earnedHC: number;
  redeemedHC: number;
  transactionDate: Date;
  netAmount: number;
  grossAmount: number;
};

const getOneApolloUserTransactions: Resolver<
  null,
  {},
  ProfilesServiceContext,
  TransactionDetails[]
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const mobNumberIN = mobileNumber.slice(3);

  const medOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const response = await medOrdersRepo.getOneApolloUserTransactions(mobNumberIN);
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
export const getOneApolloUserTransactionsResolvers = {
  Query: {
    getOneApolloUserTransactions,
  },
};
