import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MedicineOrderInvoice,
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

export const saveOrderShipmentInvoiceTypeDefs = gql`
  input SaveOrderShipmentInvoiceInput {
    orderid: Int!
    status: String
    apOrderNo: String
    timestamp: String!
    referenceNo: String
    billingDetails: BillingDetails
    itemDetails: [ArticleDetails]
  }

  input ArticleDetails {
    articleCode: String
    articleName: String
    quantity: Int
    batch: String
    unitPrice: Int
  }

  input BillingDetails {
    invoiceTime: String
    invoiceNo: String
    invoiceValue: String
  }

  type SaveOrderShipmentInvoiceResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderid: Int
    apOrderNo: String
  }

  extend type Mutation {
    SaveOrderShipmentInvoice(
      saveOrderShipmentInvoiceInput: SaveOrderShipmentInvoiceInput
    ): SaveOrderShipmentInvoiceResult!
  }
`;

type SaveOrderShipmentInvoiceResult = {
  status: string;
  errorCode: number;
  errorMessage: string;
  orderid: number;
  apOrderNo: string;
};

type SaveOrderShipmentInvoiceInput = {
  orderid: number;
  status: MEDICINE_ORDER_STATUS;
  apOrderNo: string;
  timestamp: string;
  referenceNo: String;
  billingDetails: BillingDetails;
  itemDetails: [ArticleDetails];
};

type BillingDetails = {
  invoiceTime: string;
  invoiceNo: string;
  invoiceValue: string;
};

type ArticleDetails = {
  articleCode: string;
  articleName: string;
  quantity: number;
  batch: string;
  unitPrice: number;
};

type saveOrderShipmentInvoiceInputArgs = {
  saveOrderShipmentInvoiceInput: SaveOrderShipmentInvoiceInput;
};

const SaveOrderShipmentInvoice: Resolver<
  null,
  saveOrderShipmentInvoiceInputArgs,
  ProfilesServiceContext,
  SaveOrderShipmentInvoiceResult
> = async (parent, { saveOrderShipmentInvoiceInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    saveOrderShipmentInvoiceInput.orderid
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  let shipmentDetails = orderDetails.medicineOrderShipments.find((shipment) => {
    return shipment.apOrderNo == saveOrderShipmentInvoiceInput.apOrderNo;
  });
  if (!shipmentDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }
  if (shipmentDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }
  console.log(orderDetails);

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
    medicineOrderShipments: shipmentDetails,
    statusDate: new Date(saveOrderShipmentInvoiceInput.timestamp),
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

  const orderInvoiceAttrs: Partial<MedicineOrderInvoice> = {
    orderNo: saveOrderShipmentInvoiceInput.orderid,
    apOrderNo: shipmentDetails.apOrderNo,
    siteId: shipmentDetails.siteId,
    billDetails: JSON.stringify({
      billDateTime: new Date(saveOrderShipmentInvoiceInput.billingDetails.invoiceTime),
      billNumber: saveOrderShipmentInvoiceInput.billingDetails.invoiceNo,
      invoiceValue: saveOrderShipmentInvoiceInput.billingDetails.invoiceValue,
    }),
    itemDetails: JSON.stringify(
      saveOrderShipmentInvoiceInput.itemDetails.map((item) => {
        return {
          itemId: item.articleCode,
          itemName: item.articleName,
          batchId: item.batch,
          issuedQty: item.quantity,
          mrp: item.quantity * item.unitPrice,
        };
      })
    ),
    medicineOrderShipments: shipmentDetails,
  };

  await medicineOrdersRepo.saveMedicineOrderInvoice(orderInvoiceAttrs);

  await medicineOrdersRepo.updateMedicineOrderShipment(
    {
      currentStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
    },
    shipmentDetails.apOrderNo
  );

  if (shipmentDetails.isPrimary) {
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(saveOrderShipmentInvoiceInput.timestamp),
      MEDICINE_ORDER_STATUS.ORDER_BILLED
    );
  }

  return {
    status: MEDICINE_ORDER_STATUS.ORDER_BILLED,
    errorCode: 0,
    errorMessage: '',
    orderid: orderDetails.orderAutoId,
    apOrderNo: shipmentDetails.apOrderNo,
  };
};

export const saveOrderShipmentInvoiceResolvers = {
  Mutation: {
    SaveOrderShipmentInvoice,
  },
};
