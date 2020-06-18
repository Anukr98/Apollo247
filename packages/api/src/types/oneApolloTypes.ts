import { ONE_APOLLO_STORE_CODE } from 'profiles-service/entities';

export type BlockOneApolloPointsRequest = {
  BusinessUnit: string;
  StoreCode: ONE_APOLLO_STORE_CODE;
  MobileNumber: number;
  CreditsRedeemed: number;
};

export type BlockUserPointsResponse = {
  Success: boolean;
  Message: string;
  RequestNumber: string;
  AvailablePoints: number;
  BalancePoints: number;
  RedeemedPoints: number;
  PointsValue: number;
};
