export enum ONE_APOLLO_STORE_CODE {
  ANDCUS = 'ANDCUS',
  IOSCUS = 'IOSCUS',
  WEBCUS = 'WEBCUS',
}
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

export type UnblockPointsRequest = {
  BusinessUnit: string;
  StoreCode: ONE_APOLLO_STORE_CODE;
  MobileNumber: string;
  PointsToRelease: string;
  RedemptionRequestNumber: string;
};

export type TierEarningsPerCategory = {
  pharma: number;
  pl: number;
  fmcg: number;
};

export enum Tier {
  Platinum = 'Platinum',
  Gold = 'Gold',
  Silver = 'Silver',
}
export type Earnings = {
  Platinum: TierEarningsPerCategory;
  Gold: TierEarningsPerCategory;
  Silver: TierEarningsPerCategory;
};
