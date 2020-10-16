import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MEDICINE_ORDER_TYPE,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes, parseISO } from 'date-fns';
import { log } from 'customWinstonLogger';

export const saveOrderVerifiedTypeDefs = gql`
  input OrderVerifiedInput {
    orderId: Int!
    status: MEDICINE_ORDER_STATUS!
    updatedDate: String!
    items: [ItemArticleDetails]
  }

  type OrderVerifiedResult {
    status: MEDICINE_ORDER_STATUS
    errorCode: Int
    errorMessage: String
    orderId: Int
    tat: String
    siteId: String
    tatType: String
    allocationProfile: String
    clusterId: String
  }

  extend type Mutation {
    saveOrderVerified(orderVerifiedInput: OrderVerifiedInput): OrderVerifiedResult!
  }
`;

type SaveOrderVerifiedResult = {
  status: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
  orderId: number;
  tat: string;
  siteId: string;
  tatType: string;
  allocationProfile: string;
  clusterId: string;
};

type SaveOrderVerifiedInput = {
  orderId: number;
  status: MEDICINE_ORDER_STATUS;
  updatedDate: string;
  items: [ItemArticleDetails];
};

type ItemArticleDetails = {
  articleCode: string;
  articleName: string;
  quantity: number;
  batch: string;
  unitPrice: number;
  packSize: number;
  posAvailability: boolean;
};

type SaveOrderVerifiedInputArgs = {
  orderVerifiedInput: SaveOrderVerifiedInput;
};

const saveOrderVerified: Resolver<
  null,
  SaveOrderVerifiedInputArgs,
  ProfilesServiceContext,
  SaveOrderVerifiedResult
> = async (parent, { orderVerifiedInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
    orderVerifiedInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  log(
    'profileServiceLogger',
    `ORDER_VERIFICATION_DONE_FOR_ORDER_ID:${orderVerifiedInput.orderId}`,
    `saveOrderVerified call from OMS`,
    JSON.stringify(orderVerifiedInput),
    ''
  );
  const statusDate = format(
    addMinutes(parseISO(orderVerifiedInput.updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.VERIFICATION_DONE,
    medicineOrders: orderDetails,
    statusDate: new Date(statusDate),
    hideStatus: false,
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

  // calculate tat for non cart orders

  let tat = '',
    siteId = '',
    tatType = '',
    allocationProfile = '',
    clusterId = '';
  if (orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER) {
    tat = '16-Oct-2020 14:30';
    siteId = '15732';
    tatType = 'Hub';
    allocationProfile = 'DEFAULT';
    clusterId = 'DEFAULT';
  }
  return {
    status: MEDICINE_ORDER_STATUS.VERIFICATION_DONE,
    errorCode: 0,
    errorMessage: '',
    orderId: orderDetails.orderAutoId,
    tat,
    siteId,
    tatType,
    allocationProfile,
    clusterId,
  };
};

export const saveOrderVerifiedResolvers = {
  Mutation: {
    saveOrderVerified,
  },
};
