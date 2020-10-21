import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes, parseISO } from 'date-fns';
import { log } from 'customWinstonLogger';

export const orderReturnPostDeliveryTypeDefs = gql`
  input OrderReturnPostDeliveryInput {
    orderId: Int!
    apOrderNo: String!
    returnTrackingId: String!
    status: MEDICINE_ORDER_STATUS!
    updatedDate: String!
    trackingProvider: String
    trackingNo: String
    driverName: String
    driverPhone: String
    reasonCode: String!
    itemDetails: [ItemArticleDetails]
    bankDetails: BankDetails
  }

  input BankDetails {
    accountNumber: String!
    ifscCode: String!
    bankName: String
    customerName: String
    customerNumber: String
  }

  type OrderReturnPostDeliveryResult {
    status: MEDICINE_ORDER_STATUS
    errorCode: Int
    errorMessage: String
    orderId: Int
  }

  extend type Mutation {
    orderReturnPostDelivery(
      orderReturnPostDeliveryInput: OrderReturnPostDeliveryInput
    ): OrderReturnPostDeliveryResult!
  }
`;

type SaveOrderReturnResult = {
  status: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
  orderId: number;
};

type SaveOrderReturnInput = {
  orderId: number;
  apOrderNo: string;
  status: MEDICINE_ORDER_STATUS;
  updatedDate: string;
  reasonCode: string;
};

type SaveOrderReturnInputArgs = {
  orderReturnInput: SaveOrderReturnInput;
};

const orderReturnPostDelivery: Resolver<
  null,
  SaveOrderReturnInputArgs,
  ProfilesServiceContext,
  SaveOrderReturnResult
> = async (parent, { orderReturnInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
    orderReturnInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  log(
    'profileServiceLogger',
    `ORDER_STATUS_CHANGE_${orderReturnInput.status}_FOR_ORDER_ID:${orderReturnInput.orderId}`,
    `orderReturned call from OMS`,
    JSON.stringify(orderReturnInput),
    ''
  );
  const statusDate = format(
    addMinutes(parseISO(orderReturnInput.updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: orderReturnInput.status,
    medicineOrders: orderDetails,
    statusDate: new Date(statusDate),
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    orderReturnInput.status
  );

  return {
    status: orderReturnInput.status,
    errorCode: 0,
    errorMessage: '',
    orderId: orderDetails.orderAutoId,
  };
};

export const orderReturnPostDeliveryResolvers = {
  Mutation: {
    orderReturnPostDelivery,
  },
};
