import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes, parseISO } from 'date-fns';
import { log } from 'customWinstonLogger';

export const orderReturnedTypeDefs = gql`
  input OrderReturnedInput {
    orderId: Int!
    apOrderNo: String!
    status: MEDICINE_ORDER_STATUS!
    updatedDate: String!
    reasonCode: String
  }

  type OrderReturnedResult {
    status: MEDICINE_ORDER_STATUS
    errorCode: Int
    errorMessage: String
    orderId: Int
  }

  extend type Mutation {
    orderReturned(orderReturnedInput: OrderReturnedInput): OrderReturnedResult!
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
  orderReturnedInput: SaveOrderReturnInput;
};

const orderReturned: Resolver<
  null,
  SaveOrderReturnInputArgs,
  ProfilesServiceContext,
  SaveOrderReturnResult
> = async (parent, { orderReturnedInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
    orderReturnedInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  log(
    'profileServiceLogger',
    `ORDER_STATUS_CHANGE_${orderReturnedInput.status}_FOR_ORDER_ID:${orderReturnedInput.orderId}`,
    `orderReturned call from OMS`,
    JSON.stringify(orderReturnedInput),
    ''
  );
  const statusDate = format(
    addMinutes(parseISO(orderReturnedInput.updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: orderReturnedInput.status,
    medicineOrders: orderDetails,
    statusDate: new Date(statusDate),
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

  if (orderReturnedInput.status == MEDICINE_ORDER_STATUS.RETURN_INITIATED)
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(),
      orderReturnedInput.status
    );

  return {
    status: orderReturnedInput.status,
    errorCode: 0,
    errorMessage: '',
    orderId: orderDetails.orderAutoId,
  };
};

export const orderReturnedResolvers = {
  Mutation: {
    orderReturned,
  },
};
