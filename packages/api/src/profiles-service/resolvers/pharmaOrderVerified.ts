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
  NotificationType,
  sendMedicineOrderStatusNotification,
} from 'notifications-service/resolvers/notifications';

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
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    saveOrderShipmentsInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const shipmentsInput = saveOrderShipmentsInput.shipments;
  let shipmentsResults;
  try {
    const shipmentsPromise = shipmentsInput.map(async (shipment, index) => {
      const orderShipmentsAttrs: Partial<MedicineOrderShipments> = {
        currentStatus: MEDICINE_ORDER_STATUS[shipment.status],
        medicineOrders: orderDetails,
        apOrderNo: shipment.apOrderNo,
        siteId: shipment.siteId,
        siteName: shipment.siteName,
        itemDetails: JSON.stringify(shipment.itemDetails),
      };
      return await medicineOrdersRepo.saveMedicineOrderShipment(orderShipmentsAttrs);
    });
    shipmentsResults = await Promise.all(shipmentsPromise);
  } catch (e) {
    throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_SHIPMENT_ERROR, undefined, e);
  }

  shipmentsResults.forEach(async (shipmentsResult, index) => {
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
      statusDate: new Date(shipmentsInput[index].updatedDate),
    };
    medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  });

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
    medicineOrders: orderDetails,
    statusDate: new Date(shipmentsInput[0].updatedDate),
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.ORDER_VERIFIED
  );

  sendMedicineOrderStatusNotification(
    NotificationType.MEDICINE_ORDER_CONFIRMED,
    orderDetails,
    profilesDb
  );

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
