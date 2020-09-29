import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MEDICINE_DELIVERY_TYPE,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { SYNC_TYPE } from 'types/inventorySync';
import { sendMedicineOrderStatusNotification } from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';
import { ApiConstants } from 'ApiConstants';
import { postEvent, WebEngageInput } from 'helpers/webEngage';
import { format, addMinutes } from 'date-fns';
import { syncInventory } from 'helpers/inventorySync';

export const pharmaOrderPlacedTypeDefs = gql`
  input OrderPlacedInput {
    orderAutoId: Int
    referenceNo: String
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
  referenceNo: string;
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
  const orderDetails = await medicineOrdersRepo.getMedicineOrderPlacedDetails(
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
  await medicineOrdersRepo.updateOrderReferenceNo(
    orderDetails.orderAutoId,
    orderDetails.id,
    orderPlacedInput.referenceNo
  );

  //send order placed notification
  sendMedicineOrderStatusNotification(
    NotificationType.MEDICINE_ORDER_PLACED,
    orderDetails,
    profilesDb
  );

  //post order placed event to webEngage
  const postBody: Partial<WebEngageInput> = {
    userId: orderDetails.patient.mobileNumber,
    eventName: ApiConstants.MEDICINE_ORDER_PLACED_EVENT_NAME.toString(),
    eventData: {
      orderId: orderDetails.orderAutoId,
      orderType: orderDetails.orderType,
      statusDateTime: format(addMinutes(new Date(), +330), "yyyy-MM-dd'T'HH:mm:ss'+0530'"),
      orderAmount: orderDetails.estimatedAmount.toString(),
      orderTAT: orderDetails.orderTat
        ? format(new Date(Date.parse(orderDetails.orderTat)), "yyyy-MM-dd'T'HH:mm:ss")
        : '',
    },
  };
  postEvent(postBody);

  orderDetails.medicineOrderLineItems = await medicineOrdersRepo.getMedicineOrderLineItemByOrderId(
    orderDetails.id
  );
  if (orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.HOME_DELIVERY) {
    syncInventory(orderDetails, SYNC_TYPE.BLOCK);
  }

  return { message: 'Order placed successfully' };
};

export const pharmaOrderPlacedResolvers = {
  Mutation: {
    saveOrderPlacedStatus,
  },
};
