import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  sendMedicineOrderStatusNotification,
  NotificationType,
} from 'notifications-service/resolvers/notifications';

export const pharmaOrderConfirmationTypeDefs = gql`
  input OrderConfirmationInput {
    ordersResult: OrderResult
  }

  input OrderResult {
    message: String
    apOrderNo: String
    orderNo: Int
    siteId: String
    status: String
  }

  type OrderConfirmationResult {
    requestStatus: String
    requestMessage: String
  }

  extend type Mutation {
    saveOrderConfirmation(orderConfirmationInput: OrderConfirmationInput): OrderConfirmationResult!
  }
`;

type OrderConfirmationInput = {
  ordersResult: OrderResult;
};

type OrderResult = {
  message: string;
  apOrderNo: string;
  orderNo: number;
  siteId: string;
  status: string;
};

type OrderConfirmationResult = {
  requestStatus: string;
  requestMessage: string;
};
type saveOrderConfirmationInputArgs = {
  orderConfirmationInput: OrderConfirmationInput;
};

const saveOrderConfirmation: Resolver<
  null,
  saveOrderConfirmationInputArgs,
  ProfilesServiceContext,
  OrderConfirmationResult
> = async (parent, { orderConfirmationInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    orderConfirmationInput.ordersResult.orderNo
  );
  if (!orderDetails) {
    console.log('11111111111111');
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    console.log('222222222222222222');
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.ORDER_CONFIRMED,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: orderConfirmationInput.ordersResult.message,
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.ORDER_CONFIRMED
  );

  await medicineOrdersRepo.updateOrderFullfillment(
    orderDetails.orderAutoId,
    orderDetails.id,
    orderConfirmationInput.ordersResult.apOrderNo
  );

  //send push notification
  sendMedicineOrderStatusNotification(
    NotificationType.MEDICINE_ORDER_CONFIRMED,
    orderDetails,
    profilesDb
  );

  return { requestStatus: 'true', requestMessage: 'order confirmation updated succssfully' };
};

export const pharmaOrderConfirmationResolvers = {
  Mutation: {
    saveOrderConfirmation,
  },
};
