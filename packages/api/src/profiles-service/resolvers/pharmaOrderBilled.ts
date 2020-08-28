import gql from 'graphql-tag';
import { Decimal } from 'decimal.js';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MedicineOrderInvoice,
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MEDICINE_DELIVERY_TYPE,
  MedicineOrderShipments,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes, parseISO } from 'date-fns';
import { log } from 'customWinstonLogger';
import { NotificationType } from 'notifications-service/constants';
import { sendMedicineOrderStatusNotification } from 'notifications-service/handlers';
import { calculateRefund } from 'profiles-service/helpers/refundHelper';
import { WebEngageInput, postEvent } from 'helpers/webEngage';
import { ApiConstants } from 'ApiConstants';

export const saveOrderShipmentInvoiceTypeDefs = gql`
  input SaveOrderShipmentInvoiceInput {
    orderId: Int!
    status: MEDICINE_ORDER_STATUS
    apOrderNo: String
    updatedDate: String!
    referenceNo: String
    billingDetails: BillingDetails
    itemDetails: [ArticleDetails]
  }

  input ArticleDetails {
    articleCode: String
    articleName: String
    quantity: Int
    batch: String
    unitPrice: Float
    discountPrice: Float
    packSize: Int
    isSubstitute: Boolean
    substitute: [SubstituteDetails]
  }

  input SubstituteDetails {
    articleCode: String
    articleName: String
    quantity: Int
    batch: String
    unitPrice: Float
    packSize: Int
    discountPrice: Float
  }

  input BillingDetails {
    invoiceTime: String
    invoiceNo: String
    invoiceValue: Float
    cashValue: Float
    prepaidValue: Float
    discountValue: Float
    deliveryCharges: Float
  }

  type SaveOrderShipmentInvoiceResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderId: Int
    apOrderNo: String
  }

  extend type Mutation {
    saveOrderShipmentInvoice(
      saveOrderShipmentInvoiceInput: SaveOrderShipmentInvoiceInput
    ): SaveOrderShipmentInvoiceResult!
  }
`;

type SaveOrderShipmentInvoiceResult = {
  status: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
  orderId: number;
  apOrderNo: string;
};

type SaveOrderShipmentInvoiceInput = {
  orderId: number;
  status: MEDICINE_ORDER_STATUS;
  apOrderNo: string;
  updatedDate: string;
  referenceNo: String;
  billingDetails: BillingDetails;
  itemDetails: ArticleDetails[];
};

type BillingDetails = {
  invoiceTime: string;
  invoiceNo: string;
  invoiceValue: number;
  cashValue: number;
  prepaidValue: number;
  discountValue: number;
  deliveryCharges: number;
};

type ArticleDetails = {
  articleCode: string;
  articleName: string;
  quantity: number;
  batch: string;
  unitPrice: number;
  discountPrice: number;
  packSize: number;
  isSubstitute: boolean;
  substitute: SubstituteDetails[];
};

type SubstituteDetails = {
  articleCode: string;
  articleName: string;
  quantity: number;
  batch: string;
  unitPrice: number;
  discountPrice: number;
  packSize: number;
};

type SaveOrderShipmentInvoiceInputArgs = {
  saveOrderShipmentInvoiceInput: SaveOrderShipmentInvoiceInput;
};

const saveOrderShipmentInvoice: Resolver<
  null,
  SaveOrderShipmentInvoiceInputArgs,
  ProfilesServiceContext,
  SaveOrderShipmentInvoiceResult
> = async (parent, { saveOrderShipmentInvoiceInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
    saveOrderShipmentInvoiceInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  const shipmentDetails = orderDetails.medicineOrderShipments.find(
    (shipment: MedicineOrderShipments) => {
      return shipment.apOrderNo == saveOrderShipmentInvoiceInput.apOrderNo;
    }
  );
  if (!shipmentDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }
  if (shipmentDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }
  const currentStatus =
    orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
      ? MEDICINE_ORDER_STATUS.READY_AT_STORE
      : MEDICINE_ORDER_STATUS.ORDER_BILLED;
  const statusDate = format(
    addMinutes(parseISO(saveOrderShipmentInvoiceInput.updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: currentStatus,
    medicineOrderShipments: shipmentDetails,
    statusDate: new Date(statusDate),
  };

  log(
    'profileServiceLogger',
    `ORDER_BILLED_API_CALL_FROM_OMS_FOR_ORDER_ID:${saveOrderShipmentInvoiceInput.orderId}`,
    `saveOrderShipmentInvoice call from OMS`,
    JSON.stringify(saveOrderShipmentInvoiceInput),
    ''
  );

  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

  const billDetails: BillingDetails = saveOrderShipmentInvoiceInput.billingDetails;
  const orderInvoiceAttrs: Partial<MedicineOrderInvoice> = {
    orderNo: saveOrderShipmentInvoiceInput.orderId,
    apOrderNo: shipmentDetails.apOrderNo,
    siteId: shipmentDetails.siteId,
    billDetails: JSON.stringify({
      billDateTime: format(
        addMinutes(parseISO(saveOrderShipmentInvoiceInput.billingDetails.invoiceTime), -330),
        "yyyy-MM-dd'T'HH:mm:ss.SSSX"
      ),
      billNumber: billDetails.invoiceNo,
      invoiceValue: billDetails.invoiceValue,
      cashValue: billDetails.cashValue,
      prepaidValue: billDetails.prepaidValue,
      discountValue: billDetails.discountValue,
      deliveryCharges: billDetails.deliveryCharges,
    }),
    itemDetails: JSON.stringify(
      saveOrderShipmentInvoiceInput.itemDetails.map((item) => {
        const quantity = +new Decimal(item.quantity).dividedBy(item.packSize).toFixed(4);
        return {
          itemId: item.articleCode,
          itemName: item.articleName,
          batchId: item.batch,
          issuedQty: quantity,
          mou: item.packSize,
          discountPrice: +new Decimal(item.discountPrice).dividedBy(quantity).toFixed(4),
          mrp: +new Decimal(item.packSize).times(item.unitPrice).toFixed(4),
        };
      })
    ),
    medicineOrderShipments: shipmentDetails,
  };

  await medicineOrdersRepo.saveMedicineOrderInvoice(orderInvoiceAttrs);

  await medicineOrdersRepo.updateMedicineOrderShipment(
    {
      currentStatus: currentStatus,
    },
    shipmentDetails.apOrderNo
  );

  const unBilledShipments = orderDetails.medicineOrderShipments.find(
    (shipment: MedicineOrderShipments) => {
      return (
        shipment.apOrderNo != shipmentDetails.apOrderNo &&
        shipment.currentStatus == MEDICINE_ORDER_STATUS.ORDER_VERIFIED
      );
    }
  );

  if (!unBilledShipments) {
    const invoices = await medicineOrdersRepo.getInvoiceDetailsByOrderId(orderDetails.orderAutoId);

    const totalOrderBilling = invoices.reduce(
      (acc: number, curValue: Partial<MedicineOrderInvoice>) => {
        if (curValue.billDetails) {
          const invoiceValue: number = JSON.parse(curValue.billDetails).invoiceValue;
          return +new Decimal(acc).plus(invoiceValue);
        }
        return acc;
      },
      0
    );

    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: currentStatus,
      medicineOrders: orderDetails,
      statusDate: new Date(statusDate),
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(statusDate),
      currentStatus
    );
    if (
      Math.abs(Math.floor(billDetails.invoiceValue) - Math.floor(orderDetails.estimatedAmount)) >
        1 &&
      orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
    ) {
      sendMedicineOrderStatusNotification(
        NotificationType.MEDICINE_ORDER_BILL_CHANGED,
        orderDetails,
        profilesDb
      );
    }
    calculateRefund(orderDetails, totalOrderBilling, profilesDb, medicineOrdersRepo);
  }

  //post order billed and packed event event to webEngage
  const postBody: Partial<WebEngageInput> = {
    userId: orderDetails.patient.mobileNumber,
    eventName: ApiConstants.MEDICINE_ORDER_BILLED_AND_PACKED_EVENT_NAME.toString(),
    eventData: {
      orderId: orderDetails.orderAutoId,
      statusDateTime: format(
        parseISO(saveOrderShipmentInvoiceInput.updatedDate),
        "yyyy-MM-dd'T'HH:mm:ss'+0530'"
      ),
      billedAmount: billDetails.invoiceValue ? billDetails.invoiceValue.toString() : '',
    },
  };
  postEvent(postBody);

  return {
    status: MEDICINE_ORDER_STATUS.ORDER_BILLED,
    errorCode: 0,
    errorMessage: '',
    orderId: orderDetails.orderAutoId,
    apOrderNo: shipmentDetails.apOrderNo,
  };
};

export const saveOrderShipmentInvoiceResolvers = {
  Mutation: {
    saveOrderShipmentInvoice,
  },
};
