import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MedicineOrderShipments,
  MEDICINE_DELIVERY_TYPE,
  MedicineOrders,
  Patient,
  OneApollTransaction,
  ONE_APOLLO_STORE_CODE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  TransactionLineItems,
  ONE_APOLLO_PRODUCT_CATEGORY,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  sendCartNotification,
  NotificationType,
  sendMedicineOrderStatusNotification,
} from 'notifications-service/resolvers/notifications';
import { format, addMinutes, parseISO } from 'date-fns';
import { log } from 'customWinstonLogger';
import { PharmaItemsResponse } from 'types/medicineOrderTypes';

export const updateOrderStatusTypeDefs = gql`
  input OrderStatusInput {
    orderId: Int!
    status: MEDICINE_ORDER_STATUS!
    trackingNo: String
    trackingUrl: String
    trackingProvider: String
    reasonCode: String
    apOrderNo: String
    updatedDate: String!
    referenceNo: String
  }

  type UpdateOrderStatusResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderId: Int
  }

  extend type Mutation {
    updateOrderStatus(updateOrderStatusInput: OrderStatusInput): UpdateOrderStatusResult!
  }
`;

type UpdateOrderStatusResult = {
  status: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
  orderId: number;
};

type OrderStatusInput = {
  orderId: number;
  status: MEDICINE_ORDER_STATUS;
  trackingNo: string;
  trackingUrl: string;
  trackingProvider: string;
  referenceNo: string;
  reasonCode: string;
  apOrderNo: string;
  updatedDate: string;
};

type OrderStatusInputArgs = {
  updateOrderStatusInput: OrderStatusInput;
};
type ItemDetails = {
  itemId: string;
  itemName: string;
  batchId: string;
  issuedQty: number;
  mrp: number;
  discountPrice: number;
};

type BillDetails = {
  billDateTime: Date;
  billNumber: string;
  invoiceValue: number;
};

interface ItemsSkuTypeMap {
  [key: string]: string;
}

enum ProductTypes {
  PHARMA = 'Pharma',
  FMCG = 'Non Pharma',
  PL = 'Private Label',
}

const updateOrderStatus: Resolver<
  null,
  OrderStatusInputArgs,
  ProfilesServiceContext,
  UpdateOrderStatusResult
> = async (parent, { updateOrderStatusInput }, { profilesDb }) => {
  let status = MEDICINE_ORDER_STATUS[updateOrderStatusInput.status];
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    updateOrderStatusInput.orderId
  );

  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const mobileNumberIn = orderDetails.patient.mobileNumber.slice(3);

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  const shipmentDetails = orderDetails.medicineOrderShipments.find((shipment) => {
    return shipment.apOrderNo == updateOrderStatusInput.apOrderNo;
  });

  if (!shipmentDetails && status != MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }
  const statusDate = format(
    addMinutes(parseISO(updateOrderStatusInput.updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  log(
    'profileServiceLogger',
    `ORDER_STATUS_CHANGE_${updateOrderStatusInput.status}_FOR_ORDER_ID:${updateOrderStatusInput.orderId}`,
    `updateOrderStatus call from OMS`,
    JSON.stringify(updateOrderStatusInput),
    ''
  );
  if (!shipmentDetails && status == MEDICINE_ORDER_STATUS.CANCELLED) {
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(statusDate),
      MEDICINE_ORDER_STATUS.CANCELLED
    );
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.CANCELLED,
      medicineOrders: orderDetails,
      statusDate: new Date(statusDate),
      statusMessage: updateOrderStatusInput.reasonCode,
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  }

  if (
    status == MEDICINE_ORDER_STATUS.DELIVERED &&
    orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
  ) {
    status = MEDICINE_ORDER_STATUS.PICKEDUP;
  }
  if (shipmentDetails) {
    if (shipmentDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
    }
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: status,
      medicineOrderShipments: shipmentDetails,
      statusDate: new Date(statusDate),
      statusMessage: updateOrderStatusInput.reasonCode,
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
    const shipmentsWithDifferentStatus = orderDetails.medicineOrderShipments.filter((shipment) => {
      if (shipment.apOrderNo != shipmentDetails.apOrderNo) {
        const sameStatusObject = shipment.medicineOrdersStatus.find((orderStatusObj) => {
          return orderStatusObj.orderStatus == status;
        });
        return !sameStatusObject;
      }
    });
    if (!shipmentsWithDifferentStatus || shipmentsWithDifferentStatus.length == 0) {
      await medicineOrdersRepo.updateMedicineOrderDetails(
        orderDetails.id,
        orderDetails.orderAutoId,
        new Date(statusDate),
        status
      );
      const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
        orderStatus: status,
        medicineOrders: orderDetails,
        statusDate: new Date(statusDate),
        statusMessage: updateOrderStatusInput.reasonCode,
      };
      await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
      if (status == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY) {
        sendMedicineOrderStatusNotification(
          NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY,
          orderDetails,
          profilesDb
        );
      }
      if (status == MEDICINE_ORDER_STATUS.DELIVERED || status == MEDICINE_ORDER_STATUS.PICKEDUP) {
        await createOneApolloTransaction(
          medicineOrdersRepo,
          orderDetails,
          orderDetails.patient,
          mobileNumberIn
        );
        const pushNotificationInput = {
          orderAutoId: orderDetails.orderAutoId,
          notificationType:
            status == MEDICINE_ORDER_STATUS.DELIVERED
              ? NotificationType.MEDICINE_ORDER_DELIVERED
              : NotificationType.MEDICINE_ORDER_PICKEDUP,
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
    orderId: orderDetails.orderAutoId,
  };
};

const createOneApolloTransaction = async (
  medicineOrdersRepo: MedicineOrdersRepository,
  order: MedicineOrders,
  patient: Patient,
  mobileNumber: string
) => {
  const invoiceDetails = await medicineOrdersRepo.getInvoiceDetailsByOrderId(order.orderAutoId);
  if (!invoiceDetails.length) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const Transaction: Partial<OneApollTransaction> = {
    Gender: patient.gender,
    BU: process.env.ONEAPOLLO_BUSINESS_UNIT || '',
    SendCommunication: true,
    CalculateHealthCredits: true,
    MobileNumber: mobileNumber,
  };

  Transaction.StoreCode = ONE_APOLLO_STORE_CODE.WEBCUS;
  if (order.bookingSource == BOOKING_SOURCE.MOBILE) {
    if (order.deviceType == DEVICE_TYPE.ANDROID) {
      Transaction.StoreCode = ONE_APOLLO_STORE_CODE.ANDCUS;
    } else {
      Transaction.StoreCode = ONE_APOLLO_STORE_CODE.IOSCUS;
    }
  }

  const transactionLineItems: Partial<TransactionLineItems>[] = [];

  const itemTypemap: ItemsSkuTypeMap = {};
  const itemSku: string[] = [];
  let grossAmount: number = 0;
  let netAmount: number = 0;
  let totalDiscount: number = 0;
  invoiceDetails.forEach((val) => {
    const itemDetails = JSON.parse(val.itemDetails);
    itemDetails.forEach((item: ItemDetails) => {
      itemSku.push(item.itemId);
      let netPrice = item.discountPrice
        ? +(item.mrp - item.discountPrice).toFixed(1) * item.issuedQty
        : +item.mrp.toFixed(1) * item.issuedQty;

      let netMrp = +item.mrp.toFixed(1) * item.issuedQty;
      let netDiscount = item.discountPrice ? +item.discountPrice.toFixed(1) * item.issuedQty : 0;

      netPrice = +netPrice.toFixed(1);
      netMrp = +netMrp.toFixed(1);
      netDiscount = +netDiscount.toFixed(1);
      transactionLineItems.push({
        ProductCode: item.itemId,
        NetAmount: netPrice,
        GrossAmount: netMrp,
        DiscountAmount: netDiscount,
      });
      totalDiscount += netDiscount;
      grossAmount += netMrp;
      netAmount += netPrice;
    });
    if (val.billDetails) {
      const billDetails: BillDetails = JSON.parse(val.billDetails);
      Transaction.BillNo = billDetails.billNumber;
      Transaction.NetAmount = netAmount;
      Transaction.TransactionDate = billDetails.billDateTime;
      Transaction.GrossAmount = grossAmount;
      Transaction.Discount = totalDiscount;
    }
  });
  const skusInfoUrl = process.env.PHARMACY_MED_BULK_PRODUCT_INFO_URL || '';
  const authToken = process.env.PHARMACY_MED_AUTH_TOKEN || '';
  const pharmaResp = await fetch(skusInfoUrl, {
    method: 'POST',
    body: JSON.stringify({
      params: itemSku.join(','),
    }),
    headers: { 'Content-Type': 'application/json', authorization: authToken },
  });
  const pharmaResponse = (await pharmaResp.json()) as PharmaItemsResponse;
  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PHARMACY: ${skusInfoUrl} - ${order.orderAutoId}`,
    'createOneApolloTransaction()->API_CALL_STARTING',
    JSON.stringify(pharmaResponse),
    ''
  );
  if (!pharmaResponse) {
    throw new AphError(AphErrorMessages.PHARMACY_SKU_FETCH_FAILED, undefined, {});
  }

  if (pharmaResponse.productdp) {
    pharmaResponse.productdp.forEach((val) => {
      if (val.type_id) {
        itemTypemap[val.sku] = val.type_id;
      } else {
        throw new AphError(AphErrorMessages.PHARMACY_SKU_NOT_FOUND, undefined, {});
      }
    });
    transactionLineItems.forEach((val, i, arr) => {
      if (val.ProductCode) {
        switch (itemTypemap[val.ProductCode]) {
          case 'PHARMA':
            arr[i].ProductName = ProductTypes.PHARMA;
            arr[i].ProductCategory = ONE_APOLLO_PRODUCT_CATEGORY.PHARMA;
            break;
          case 'FMCG':
            arr[i].ProductName = ProductTypes.FMCG;
            arr[i].ProductCategory = ONE_APOLLO_PRODUCT_CATEGORY.NON_PHARMA;
            break;
          case 'PL':
            arr[i].ProductName = ProductTypes.PL;
            arr[i].ProductCategory = ONE_APOLLO_PRODUCT_CATEGORY.PRIVATE_LABEL;
            break;
        }
      }
    });
    Transaction.TransactionLineItems = transactionLineItems;
    log(
      'profileServiceLogger',
      `oneApollo Transaction Payload- ${order.orderAutoId}`,
      'createOneApolloTransaction()',
      JSON.stringify(Transaction),
      ''
    );
    const oneApolloResponse = await medicineOrdersRepo.createOneApolloTransaction(Transaction);
    log(
      'profileServiceLogger',
      `oneApollo Transaction response- ${order.orderAutoId}`,
      'createOneApolloTransaction()',
      JSON.stringify(oneApolloResponse),
      ''
    );
  } else {
    throw new AphError(AphErrorMessages.INVALID_RESPONSE_FOR_SKU_PHARMACY, undefined, {});
  }
};

export const updateOrderStatusResolvers = {
  Mutation: {
    updateOrderStatus,
  },
};
