import gql from 'graphql-tag';
import { Decimal } from 'decimal.js';
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
  BOOKING_SOURCE,
  DEVICE_TYPE,
  TransactionLineItems,
  ONE_APOLLO_PRODUCT_CATEGORY,
  MedicineOrderInvoice,
} from 'profiles-service/entities';
import { ONE_APOLLO_STORE_CODE } from 'types/oneApolloTypes';

import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  NotificationType,
  medicineOrderCancelled,
  sendMedicineOrderStatusNotification,
} from 'notifications-service/resolvers/notifications';
import { format, addMinutes, parseISO } from 'date-fns';
import { log } from 'customWinstonLogger';
import { PharmaItemsResponse } from 'types/medicineOrderTypes';
import { OneApollo } from 'helpers/oneApollo';
import { calculateRefund } from 'profiles-service/helpers/refundHelper';
import { WebEngageInput, postEvent } from 'helpers/webEngage';
import { ApiConstants } from 'ApiConstants';

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
  log(
    'profileServiceLogger',
    `ORDER_STATUS_CHANGE_${updateOrderStatusInput.status}_FOR_ORDER_ID:${updateOrderStatusInput.orderId}`,
    `updateOrderStatus call from OMS`,
    JSON.stringify(updateOrderStatusInput),
    ''
  );

  let status = MEDICINE_ORDER_STATUS[updateOrderStatusInput.status];
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
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
    medicineOrderCancelled(orderDetails, updateOrderStatusInput.reasonCode, profilesDb);
    calculateRefund(orderDetails, 0, profilesDb, medicineOrdersRepo);
  }

  if (
    status == MEDICINE_ORDER_STATUS.DELIVERED &&
    orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
  ) {
    status = MEDICINE_ORDER_STATUS.PICKEDUP;

    //post order picked up  event to webEngage
    const postBody: Partial<WebEngageInput> = {
      userId: orderDetails.patient.mobileNumber,
      eventName: ApiConstants.MEDICINE_ORDER_KERB_PICKEDUP_EVENT_NAME.toString(),
      eventData: {
        orderId: orderDetails.orderAutoId,
        statusDateTime: format(
          parseISO(updateOrderStatusInput.updatedDate),
          "yyyy-MM-dd'T'HH:mm:ss'+0530'"
        ),
      },
    };
    postEvent(postBody);
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
    let invoiceIds: string[] = [];

    /**
     * Shipments which are neigther cancelled nor billed are unresolved shipments
     */
    let hasUnresolvedShipments: boolean = false;

    let resolvedShipments: MedicineOrderShipments['id'][] = [];

    // Variable for array of invoices for the orderId
    let invoices: MedicineOrderInvoice[] = [];

    /**
     * Total order billing happened till now,
     * For all the shipments excluding already canceled ones
     * Will be stored in it
     */
    let totalOrderBilling: number = 0;

    /**
     * If current shipment in context is canceled
     * then fetch all the invoices related to the orderId
     */
    if (status === MEDICINE_ORDER_STATUS.CANCELLED) {
      invoices = await medicineOrdersRepo.getInvoiceWithShipment(orderDetails.orderAutoId);
      invoiceIds = invoices.map((invoice: MedicineOrderInvoice) => {
        return invoice.medicineOrderShipments.id;
      });
    }
    const shipmentsWithDifferentStatus = orderDetails.medicineOrderShipments.filter((shipment) => {
      /**
       * If any of the shipment is neighther invoiced nor cancelled,
       * then don't initiate refund here as it will happen in pharmaOrderBilled
       */
      if (!invoiceIds.includes(shipment.id)) {
        if (
          shipment.currentStatus != MEDICINE_ORDER_STATUS.CANCELLED &&
          shipment.id !== shipmentDetails.id
        ) {
          hasUnresolvedShipments = true;
        }
      } else {
        if (
          !hasUnresolvedShipments &&
          shipment.currentStatus != MEDICINE_ORDER_STATUS.CANCELLED &&
          shipment.id !== shipmentDetails.id
        ) {
          resolvedShipments.push(shipment.id);
        }
      }

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

        //post order out for delivery event to webEngage
        const postBody: Partial<WebEngageInput> = {
          userId: orderDetails.patient.mobileNumber,
          eventName: ApiConstants.MEDICINE_ORDER_DISPATCHED_EVENT_NAME.toString(),
          eventData: {
            orderId: orderDetails.orderAutoId,
            statusDateTime: format(
              parseISO(updateOrderStatusInput.updatedDate),
              "yyyy-MM-dd'T'HH:mm:ss'+0530'"
            ),
            DSP: orderShipmentsAttrs.trackingProvider,
            AWBNumber: orderShipmentsAttrs.trackingNo,
          },
        };
        postEvent(postBody);
      }
      if (status == MEDICINE_ORDER_STATUS.DELIVERED || status == MEDICINE_ORDER_STATUS.PICKEDUP) {
        const notificationType =
          status == MEDICINE_ORDER_STATUS.DELIVERED
            ? NotificationType.MEDICINE_ORDER_DELIVERED
            : NotificationType.MEDICINE_ORDER_PICKEDUP;
        sendMedicineOrderStatusNotification(notificationType, orderDetails, profilesDb);
        await createOneApolloTransaction(
          medicineOrdersRepo,
          orderDetails,
          orderDetails.patient,
          mobileNumberIn
        );

        //post order delivered event to webEngage
        const postBody: Partial<WebEngageInput> = {
          userId: orderDetails.patient.mobileNumber,
          eventName: ApiConstants.MEDICINE_ORDER_DELIVERED_EVENT_NAME.toString(),
          eventData: {
            orderId: orderDetails.orderAutoId,
            statusDateTime: format(
              parseISO(updateOrderStatusInput.updatedDate),
              "yyyy-MM-dd'T'HH:mm:ss'+0530'"
            ),
          },
        };
        postEvent(postBody);
      }
      if (status == MEDICINE_ORDER_STATUS.CANCELLED) {
        medicineOrderCancelled(orderDetails, updateOrderStatusInput.reasonCode, profilesDb);

        //post order cancelled event to webEngage
        const postBody: Partial<WebEngageInput> = {
          userId: orderDetails.patient.mobileNumber,
          eventName: ApiConstants.MEDICINE_ORDER_CANCELLED_EVENT_NAME.toString(),
          eventData: {
            orderId: orderDetails.orderAutoId,
            statusDateTime: format(
              parseISO(updateOrderStatusInput.updatedDate),
              "yyyy-MM-dd'T'HH:mm:ss'+0530'"
            ),
          },
        };
        postEvent(postBody);
      }
    }
    if (!hasUnresolvedShipments && status === MEDICINE_ORDER_STATUS.CANCELLED) {
      totalOrderBilling = invoices.reduce(
        (acc: number, curValue: Partial<MedicineOrderInvoice>) => {
          if (
            curValue.billDetails &&
            curValue.medicineOrderShipments &&
            resolvedShipments.includes(curValue.medicineOrderShipments.id)
          ) {
            const invoiceValue: number = JSON.parse(curValue.billDetails).invoiceValue;
            return +new Decimal(acc).plus(invoiceValue);
          }
          return acc;
        },
        0
      );
      calculateRefund(orderDetails, totalOrderBilling, profilesDb, medicineOrdersRepo);
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
    log(
      'profileServiceLogger',
      `invalid Invoice: $ - ${order.orderAutoId}`,
      'createOneApolloTransaction',
      JSON.stringify(order),
      'true'
    );
    return true;
  }

  const Transaction: Partial<OneApollTransaction> = {
    Gender: patient.gender,
    BU: process.env.ONEAPOLLO_BUSINESS_UNIT || '',
    SendCommunication: true,
    CalculateHealthCredits: true,
    MobileNumber: mobileNumber,
    CreditsRedeemed: order.medicineOrderPayments[0].healthCreditsRedeemed,
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
  let netAmount: number = 0;
  let totalDiscount: number = 0;
  invoiceDetails.forEach((val) => {
    const itemDetails = JSON.parse(val.itemDetails);
    itemDetails.forEach((item: ItemDetails) => {
      itemSku.push(item.itemId);
      const netMrp = Number(new Decimal(item.mrp).times(item.issuedQty).toFixed(1));
      let netDiscount = 0;
      if (item.discountPrice) {
        netDiscount = Number(new Decimal(item.discountPrice).times(item.issuedQty).toFixed(1));
      }
      const netPrice: number = +new Decimal(netMrp).minus(netDiscount);
      log(
        'profileServiceLogger',
        `oneApollo Transaction Payload- ${order.orderAutoId}`,
        'createOneApolloTransaction()',
        JSON.stringify({ netPrice: netPrice, netDiscount: netDiscount, netMrp: netMrp }),
        ''
      );

      transactionLineItems.push({
        ProductCode: item.itemId,
        NetAmount: netPrice,
        GrossAmount: netMrp,
        DiscountAmount: netDiscount,
      });
      totalDiscount = +new Decimal(netDiscount).plus(totalDiscount);
      netAmount = +new Decimal(netPrice).plus(netAmount);
    });
    if (val.billDetails) {
      const billDetails: BillDetails = JSON.parse(val.billDetails);
      Transaction.BillNo = `${billDetails.billNumber}_${order.orderAutoId}`;
      Transaction.NetAmount = netAmount;
      Transaction.TransactionDate = billDetails.billDateTime;
      Transaction.GrossAmount = +new Decimal(netAmount).plus(totalDiscount);
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
        switch (itemTypemap[val.ProductCode].toLowerCase()) {
          case 'pharma':
            arr[i].ProductName = ProductTypes.PHARMA;
            arr[i].ProductCategory = ONE_APOLLO_PRODUCT_CATEGORY.PHARMA;
            break;
          case 'fmcg':
            arr[i].ProductName = ProductTypes.FMCG;
            arr[i].ProductCategory = ONE_APOLLO_PRODUCT_CATEGORY.NON_PHARMA;
            break;
          case 'pl':
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

    const oneApollo = new OneApollo();
    const oneApolloResponse = await oneApollo.createOneApolloTransaction(Transaction);
    log(
      'profileServiceLogger',
      `oneApollo Transaction response- ${order.orderAutoId}`,
      'createOneApolloTransaction()',
      JSON.stringify(oneApolloResponse),
      ''
    );
    return true;
  } else {
    throw new AphError(AphErrorMessages.INVALID_RESPONSE_FOR_SKU_PHARMACY, undefined, {});
  }
};

export const updateOrderStatusResolvers = {
  Mutation: {
    updateOrderStatus,
  },
};
