import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  NotificationType,
  sendMedicineOrderStatusNotification,
} from 'notifications-service/resolvers/notifications';

export const pharmaOrderPlacedTypeDefs = gql`
  input OrderPlacedInput {
    orderAutoId: Int
  }

  type OrderPlacedResult {
    message: String
  }

  extend type Mutation {
    saveOrderPlacedStatus(orderPlacedInput: OrderPlacedInput): OrderPlacedResult!
  }
`;

type OrderPlacedInput = {
  orderAutoId: number;
};

type OrderPlacedResult = {
  message: string;
};
type orderPlacedInputArgs = {
  orderPlacedInput: OrderPlacedInput;
};

const saveOrderPlacedStatus: Resolver<
  null,
  orderPlacedInputArgs,
  ProfilesServiceContext,
  OrderPlacedResult
> = async (parent, { orderPlacedInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    orderPlacedInput.orderAutoId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: '',
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.ORDER_PLACED
  );

  //send order placed notification
  sendMedicineOrderStatusNotification(
    NotificationType.MEDICINE_ORDER_PLACED,
    orderDetails,
    profilesDb
  );

  return { message: 'Order placed successfully' };
};

export const pharmaOrderPlacedResolvers = {
  Mutation: {
    saveOrderPlacedStatus,
  },
};
