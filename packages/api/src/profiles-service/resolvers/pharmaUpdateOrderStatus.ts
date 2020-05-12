import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MedicineOrderShipments,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  sendCartNotification,
  NotificationType,
  sendMedicineOrderStatusNotification,
} from 'notifications-service/resolvers/notifications';

export const updateOrderStatusTypeDefs = gql`
  input OrderStatusInput {
    orderid: Int!
    status: String!
    trackingNo: String
    trackingUrl: String
    trackingProvider: String
    reasonCode: String
    apOrderNo: String
    timestamp: String!
    referenceNo: String
  }

  type UpdateOrderStatusResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderid: Int
  }

  extend type Mutation {
    UpdateOrderStatus(updateOrderStatusInput: OrderStatusInput): UpdateOrderStatusResult!
  }
`;

type UpdateOrderStatusResult = {
  status: string;
  errorCode: number;
  errorMessage: string;
  orderid: number;
};

type OrderStatusInput = {
  orderid: number;
  status: MEDICINE_ORDER_STATUS;
  trackingNo: string;
  trackingUrl: string;
  trackingProvider: string;
  referenceNo: string;
  reasonCode: string;
  apOrderNo: string;
  timestamp: string;
};

type orderStatusInputArgs = {
  updateOrderStatusInput: OrderStatusInput;
};

const UpdateOrderStatus: Resolver<
  null,
  orderStatusInputArgs,
  ProfilesServiceContext,
  UpdateOrderStatusResult
> = async (parent, { updateOrderStatusInput }, { profilesDb }) => {
  const status = MEDICINE_ORDER_STATUS[updateOrderStatusInput.status];
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    updateOrderStatusInput.orderid
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  console.log(orderDetails);
  let shipmentDetails = orderDetails.medicineOrderShipments.find((shipment) => {
    return shipment.apOrderNo == updateOrderStatusInput.apOrderNo;
  });

  if (!shipmentDetails && status != MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }

  if (!shipmentDetails && status == MEDICINE_ORDER_STATUS.CANCELLED) {
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(updateOrderStatusInput.timestamp),
      MEDICINE_ORDER_STATUS.CANCELLED
    );
  }

  if (shipmentDetails) {
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: status,
      medicineOrderShipments: shipmentDetails,
      statusDate: new Date(updateOrderStatusInput.timestamp),
    };
    try {
      await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
    } catch (e) {
      throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_STATUS_ERROR, undefined, e);
    }
    const orderShipmentsAttrs: Partial<MedicineOrderShipments> = {
      currentStatus: status,
      trackingNo: updateOrderStatusInput.trackingNo || shipmentDetails.trackingNo,
      trackingUrl: updateOrderStatusInput.trackingUrl || shipmentDetails.trackingUrl,
      trackingProvider: updateOrderStatusInput.trackingProvider || shipmentDetails.trackingProvider,
      cancelReasonCode: updateOrderStatusInput.reasonCode || shipmentDetails.cancelReasonCode,
    };
    try {
      await medicineOrdersRepo.updateMedicineOrderShipment(
        orderShipmentsAttrs,
        shipmentDetails.apOrderNo
      );
    } catch (e) {
      throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_SHIPMENT_ERROR, undefined, e);
    }
    if (shipmentDetails.isPrimary) {
      await medicineOrdersRepo.updateMedicineOrderDetails(
        orderDetails.id,
        orderDetails.orderAutoId,
        new Date(updateOrderStatusInput.timestamp),
        status
      );
      if (status == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY) {
        sendMedicineOrderStatusNotification(
          NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY,
          orderDetails,
          profilesDb
        );
      }
      if (status == MEDICINE_ORDER_STATUS.DELIVERED) {
        const pushNotificationInput = {
          orderAutoId: orderDetails.orderAutoId,
          notificationType: NotificationType.MEDICINE_ORDER_DELIVERED,
        };
        console.log(pushNotificationInput, 'pushNotificationInput');
        const notificationResult = sendCartNotification(pushNotificationInput, profilesDb);
        console.log(notificationResult, 'medicine order delivered notification');
      }
    }
  }

  return {
    status: updateOrderStatusInput.status,
    errorCode: 0,
    errorMessage: '',
    orderid: orderDetails.orderAutoId,
  };
};

export const updateOrderStatusResolvers = {
  Mutation: {
    UpdateOrderStatus,
  },
};
