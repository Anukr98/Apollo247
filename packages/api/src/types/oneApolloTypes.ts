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
  RedemptionRequestNumber: BlockUserPointsResponse['RequestNumber'];
};

export type ItemDetails = {
  itemId: string;
  itemName: string;
  batchId: string;
  issuedQty: number;
  mrp: number;
  discountPrice: number;
};

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export type ONE_APOLLO_USER_REG = {
  FirstName: string;
  LastName: string;
  MobileNumber: string;
  Gender: Gender;
  BusinessUnit: string;
  StoreCode: string;
  CustomerId: string;
};

export enum ONE_APOLLO_PRODUCT_CATEGORY {
  PRIVATE_LABEL = 'A247',
  NON_PHARMA = 'F247',
  PHARMA = 'P247',
}

export type OneApollTransaction = {
  BillNo: string;
  BU: string;
  StoreCode: string;
  NetAmount: number;
  GrossAmount: number;
  TransactionDate: Date;
  MobileNumber: string;
  SendCommunication: boolean;
  CalculateHealthCredits: boolean;
  Gender: Gender;
  Discount: number;
  CreditsRedeemed?: number;
  RedemptionRequestNo?: BlockUserPointsResponse['RequestNumber'];
  TransactionLineItems: TransactionLineItems[];
};

export interface TransactionLineItemsPartial {
  ProductCode: string;
  NetAmount: number;
  GrossAmount: number;
  DiscountAmount: number;
}

export interface TransactionLineItems extends TransactionLineItemsPartial {
  ProductName: string;
  ProductCategory: ONE_APOLLO_PRODUCT_CATEGORY;
  PointsRedeemed?: number;
}
