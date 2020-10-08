import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import { format, addMinutes, parseISO } from 'date-fns';

export const updateOrderOnHoldTypeDefs = gql`
  input UpdateOrderOnHoldInput {
    orderId: Int!
    holdStatus: String
    updatedDate: String!
    reasonCode: String
  }

  type updateOrderOnHoldResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderId: Int
  }

  extend type Mutation {
    updateOrderOnHold(updateOrderOnHoldInput: UpdateOrderOnHoldInput): updateOrderOnHoldResult!
  }
`;

type updateOrderOnHoldResult = {
  status: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
  orderId: number;
};

type UpdateOrderOnHoldInput = {
  orderId: number;
  updatedDate: string;
  holdStatus: string;
  reasonCode: string;
};

type UpdateOrderOnHoldInputInputArgs = {
  updateOrderOnHoldInput: UpdateOrderOnHoldInput;
};

const updateOrderOnHold: Resolver<
  null,
  UpdateOrderOnHoldInputInputArgs,
  ProfilesServiceContext,
  updateOrderOnHoldResult
> = async (parent, { updateOrderOnHoldInput }, { profilesDb }) => {
  log(
    'profileServiceLogger',
    `ORDER_IS_ON_HOLD_CALL_FROM_OMS_FOR_ORDER_ID:${updateOrderOnHoldInput.orderId}`,
    `updateOrderOnHold`,
    JSON.stringify(updateOrderOnHoldInput),
    ''
  );
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
    updateOrderOnHoldInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const statusDate = format(
    addMinutes(parseISO(updateOrderOnHoldInput.updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.ON_HOLD,
    medicineOrders: orderDetails,
    statusDate: new Date(statusDate),
    statusMessage: updateOrderOnHoldInput.reasonCode,
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(statusDate),
    MEDICINE_ORDER_STATUS.ON_HOLD
  );
  return {
    status: MEDICINE_ORDER_STATUS.ON_HOLD,
    errorCode: 0,
    errorMessage: '',
    orderId: orderDetails.orderAutoId,
  };
};

export const updateOrderOnHoldResolvers = {
  Mutation: {
    updateOrderOnHold,
  },
};
