import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';

import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  sendCartNotification,
  sendMedicineOrderStatusNotification,
} from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';
import { createOneApolloTransaction } from 'profiles-service/helpers/OneApolloTransactionHelper';

export const pharmaOrderDeliveredTypeDefs = gql`
  input OrderDeliveryInput {
    ordersResult: DeliveryOrderResult
  }

  input DeliveryOrderResult {
    message: String
    apOrderNo: String
  }

  input OutForDeliveryInput {
    ordersResult: OutForDeliveryInputParameters
  }

  input OutForDeliveryInputParameters {
    message: String
    statusDateTime: String
    apOrderNo: String
  }

  type OrderDeliveryResult {
    requestStatus: String
    requestMessage: String
  }

  extend type Mutation {
    saveOrderDeliveryStatus(orderDeliveryInput: OrderDeliveryInput): OrderDeliveryResult!
    saveOrderOutForDeliveryStatus(outForDeliveryInput: OutForDeliveryInput): OrderDeliveryResult!
  }
  extend type Query {
    pushOneApolloTransaction(orderId: Int!): Boolean!
  }
`;

type OrderDeliveryInput = {
  ordersResult: DeliveryOrderResult;
};

type DeliveryOrderResult = {
  message: string;
  apOrderNo: string;
};

type OutForDeliveryInput = {
  ordersResult: OutForDeliveryInputParameters;
};

type OutForDeliveryInputParameters = {
  message: string;
  statusDateTime: string;
  apOrderNo: string;
};

type OrderDeliveryResult = {
  requestStatus: string;
  requestMessage: string;
};
type orderDeliveryInputArgs = {
  orderDeliveryInput: OrderDeliveryInput;
};

type OutForDeliveryInputArgs = {
  outForDeliveryInput: OutForDeliveryInput;
};

const saveOrderDeliveryStatus: Resolver<
  null,
  orderDeliveryInputArgs,
  ProfilesServiceContext,
  OrderDeliveryResult
> = async (parent, { orderDeliveryInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetailsByAp(
    orderDeliveryInput.ordersResult.apOrderNo
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.DELIVERED,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: orderDeliveryInput.ordersResult.message,
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.DELIVERED
  );
  const mobileNumberIn = orderDetails.patient.mobileNumber.slice(3);

  await createOneApolloTransaction(
    medicineOrdersRepo,
    orderDetails,
    orderDetails.patient,
    mobileNumberIn,
    orderDeliveryInput.ordersResult.apOrderNo
  );

  const pushNotificationInput = {
    orderAutoId: orderDetails.orderAutoId,
    notificationType: NotificationType.MEDICINE_ORDER_DELIVERED,
  };
  const notificationResult = sendCartNotification(pushNotificationInput, profilesDb);
  console.log(notificationResult, 'medicine order delivered notification');

  return { requestStatus: 'true', requestMessage: 'Delivery status updated successfully' };
};

const pushOneApolloTransaction: Resolver<
  null,
  { orderId: number },
  ProfilesServiceContext,
  boolean
> = async (parent, { orderId }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetailsByOrderAutoId(orderId);
  if (orderDetails && orderDetails.patient) {
    const mobileNumberIn = orderDetails.patient.mobileNumber.slice(3);
    const apOrderNo = orderDetails.medicineOrderShipments[0].apOrderNo;
    return await createOneApolloTransaction(
      medicineOrdersRepo,
      orderDetails,
      orderDetails.patient,
      mobileNumberIn,
      apOrderNo
    );
  }
  return true;
};

const saveOrderOutForDeliveryStatus: Resolver<
  null,
  OutForDeliveryInputArgs,
  ProfilesServiceContext,
  OrderDeliveryResult
> = async (parent, { outForDeliveryInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetailsByAp(
    outForDeliveryInput.ordersResult.apOrderNo
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
    medicineOrders: orderDetails,
    statusDate: new Date(outForDeliveryInput.ordersResult.statusDateTime),
    statusMessage: outForDeliveryInput.ordersResult.message,
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY
  );

  //send order out for delivery notification
  sendMedicineOrderStatusNotification(
    NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY,
    orderDetails,
    profilesDb
  );

  return { requestStatus: 'true', requestMessage: 'Delivery status updated successfully' };
};

export const pharmaOrderDeliveryResolvers = {
  Mutation: {
    saveOrderDeliveryStatus,
    saveOrderOutForDeliveryStatus,
  },
  Query: {
    pushOneApolloTransaction,
  },
};
