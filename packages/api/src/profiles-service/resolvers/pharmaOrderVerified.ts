import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MedicineOrderShipments,
  MEDICINE_DELIVERY_TYPE,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  NotificationType,
  sendMedicineOrderStatusNotification,
  sendCartNotification,
} from 'notifications-service/resolvers/notifications';
import { format, addMinutes, parseISO } from 'date-fns';
import { log } from 'customWinstonLogger';
import { WebEngageInput, postEvent } from 'helpers/webEngage';
import { ApiConstants } from 'ApiConstants';

export const saveOrderShipmentsTypeDefs = gql`
  input SaveOrderShipmentsInput {
    orderId: Int!
    split: Boolean
    referenceNo: String
    shipments: [Shipment]
  }

  input Shipment {
    status: MEDICINE_ORDER_STATUS!
    siteId: String
    siteName: String
    apOrderNo: String
    updatedDate: String!
    itemDetails: [ItemArticleDetails]
  }

  input ItemArticleDetails {
    articleCode: String
    articleName: String
    quantity: Int
    batch: String
    unitPrice: Float
    packSize: Int
  }

  type SaveOrderShipmentsResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderId: Int
  }

  extend type Mutation {
    saveOrderShipments(saveOrderShipmentsInput: SaveOrderShipmentsInput): SaveOrderShipmentsResult!
  }
`;

type SaveOrderShipmentsResult = {
  status: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
  orderId: number;
};

type SaveOrderShipmentsInput = {
  orderId: number;
  split: boolean;
  referenceNo: String;
  shipments: Shipment[];
};

type Shipment = {
  siteId: string;
  siteName: string;
  apOrderNo: string;
  updatedDate: string;
  status: MEDICINE_ORDER_STATUS;
  itemDetails: ItemArticleDetails[];
};

type ItemArticleDetails = {
  articleCode: string;
  articleName: string;
  quantity: number;
  batch: string;
  unitPrice: number;
  packSize: number;
};

type SaveOrderShipmentsInputArgs = {
  saveOrderShipmentsInput: SaveOrderShipmentsInput;
};

const saveOrderShipments: Resolver<
  null,
  SaveOrderShipmentsInputArgs,
  ProfilesServiceContext,
  SaveOrderShipmentsResult
> = async (parent, { saveOrderShipmentsInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
    saveOrderShipmentsInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  log(
    'profileServiceLogger',
    `ORDER_VERIFIED_FOR_ORDER_ID:${saveOrderShipmentsInput.orderId}`,
    `order verified call from OMS`,
    JSON.stringify(saveOrderShipmentsInput),
    ''
  );

  let shipmentsInput = saveOrderShipmentsInput.shipments;
  const existingShipments: Shipment[] = [];
  if (orderDetails.medicineOrderShipments && orderDetails.medicineOrderShipments.length > 0) {
    shipmentsInput = shipmentsInput.filter((shipment) => {
      const savedShipment = orderDetails.medicineOrderShipments.find((savdShipment) => {
        return savdShipment.apOrderNo == shipment.apOrderNo;
      });
      if (savedShipment) {
        existingShipments.push({ ...savedShipment, ...shipment });
      }
      return !savedShipment;
    });
  }
  if (existingShipments.length > 0) {
    try {
      const shipmentsPromise = existingShipments.map(async (shipment, index) => {
        const orderShipmentsAttrs: Partial<MedicineOrderShipments> = {
          siteId: shipment.siteId,
          siteName: shipment.siteName,
        };
        return await medicineOrdersRepo.updateMedicineOrderShipment(
          orderShipmentsAttrs,
          shipment.apOrderNo
        );
      });
      await Promise.all(shipmentsPromise);
    } catch (e) {
      throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_SHIPMENT_ERROR, undefined, e);
    }
  }
  if (shipmentsInput.length == 0) {
    return {
      status: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
      errorCode: 0,
      errorMessage: '',
      orderId: orderDetails.orderAutoId,
    };
  }
  let shipmentsResults;
  try {
    const shipmentsPromise = shipmentsInput.map(async (shipment, index) => {
      const itemDetails = shipment.itemDetails.map((item) => {
        return {
          ...item,
          quantity: Number((item.quantity / item.packSize).toFixed(2)),
          mrp: Number((item.unitPrice * item.packSize).toFixed(2)),
        };
      });
      const orderShipmentsAttrs: Partial<MedicineOrderShipments> = {
        currentStatus: MEDICINE_ORDER_STATUS[shipment.status],
        medicineOrders: orderDetails,
        apOrderNo: shipment.apOrderNo,
        siteId: shipment.siteId,
        siteName: shipment.siteName,
        itemDetails: JSON.stringify(itemDetails),
      };
      return await medicineOrdersRepo.saveMedicineOrderShipment(orderShipmentsAttrs);
    });
    shipmentsResults = await Promise.all(shipmentsPromise);
  } catch (e) {
    throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_SHIPMENT_ERROR, undefined, e);
  }
  shipmentsResults.forEach(async (shipmentsResult, index) => {
    const statusDate = format(
      addMinutes(parseISO(shipmentsInput[index].updatedDate), -330),
      "yyyy-MM-dd'T'HH:mm:ss.SSSX"
    );
    medicineOrdersRepo.saveMedicineOrderStatus(
      {
        orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
        medicineOrderShipments: shipmentsResult,
        statusDate: new Date(orderDetails.orderDateTime),
      },
      orderDetails.orderAutoId
    );
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
      medicineOrderShipments: shipmentsResult,
      statusDate: new Date(statusDate),
    };
    medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  });
  const statusDate = format(
    addMinutes(parseISO(shipmentsInput[0].updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
    medicineOrders: orderDetails,
    statusDate: new Date(statusDate),
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.ORDER_VERIFIED
  );

  if (orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP) {
    sendMedicineOrderStatusNotification(
      NotificationType.MEDICINE_ORDER_READY_AT_STORE,
      orderDetails,
      profilesDb
    );

    //post order ready at store event to webEngage
    const postBody: Partial<WebEngageInput> = {
      userId: orderDetails.patient.mobileNumber,
      eventName: ApiConstants.MEDICINE_ORDER_KERB_STORE_READY_EVENT_NAME.toString(),
      eventData: {
        orderId: orderDetails.orderAutoId,
        statusDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'+0530'"),
      },
    };
    postEvent(postBody);
  } else {
    const pushNotificationInput = {
      orderAutoId: orderDetails.orderAutoId,
      notificationType: NotificationType.MEDICINE_ORDER_CONFIRMED,
    };
    sendCartNotification(pushNotificationInput, profilesDb);
  }

  //post order verified event to webEngage
  const postBody: Partial<WebEngageInput> = {
    userId: orderDetails.patient.mobileNumber,
    eventName: ApiConstants.MEDICINE_ORDER_VERIFIED_EVENT_NAME.toString(),
    eventData: {
      orderId: orderDetails.orderAutoId,
      statusDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'+0530'"),
    },
  };
  postEvent(postBody);

  return {
    status: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
    errorCode: 0,
    errorMessage: '',
    orderId: orderDetails.orderAutoId,
  };
};

export const saveOrderShipmentsResolvers = {
  Mutation: {
    saveOrderShipments,
  },
};
