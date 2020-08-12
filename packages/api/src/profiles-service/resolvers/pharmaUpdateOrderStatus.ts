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
  TransactionLineItemsPartial,
} from 'profiles-service/entities';
import {
  ONE_APOLLO_STORE_CODE,
  TierEarningsPerCategory,
  Tier,
  Earnings,
} from 'types/oneApolloTypes';

import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  NotificationType,
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

enum ProductTypePharmacy {
  pharma = 'pharma',
  fmcg = 'fmcg',
  pl = 'pl',
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
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithPaymentAndShipments(
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
    calculateRefund(
      orderDetails,
      0,
      profilesDb,
      medicineOrdersRepo,
      updateOrderStatusInput.reasonCode
    );
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
      calculateRefund(
        orderDetails,
        totalOrderBilling,
        profilesDb,
        medicineOrdersRepo,
        updateOrderStatusInput.reasonCode
      );
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
  try {
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
    const transactionArr = await generateTransactions(invoiceDetails, patient, mobileNumber, order);
    if (transactionArr) {
      log(
        'profileServiceLogger',
        `oneApollo Transaction Payload- ${order.orderAutoId}`,
        'createOneApolloTransaction()',
        JSON.stringify(transactionArr),
        ''
      );
      const transactionsPromise: Promise<JSON>[] = [];
      const oneApollo = new OneApollo();
      transactionArr.forEach((transaction) => {
        transactionsPromise.push(oneApollo.createOneApolloTransaction(transaction));
      });
      const oneApolloRes = await Promise.all(transactionsPromise);

      log(
        'profileServiceLogger',
        `oneApollo Transaction response- ${order.orderAutoId}`,
        'createOneApolloTransaction()',
        JSON.stringify(oneApolloRes),
        ''
      );
    }
    return true;
  } catch (e) {
    log(
      'profileServiceLogger',
      `oneApollo Transaction response - ${order.orderAutoId}`,
      'createOneApolloTransaction()',
      e.stack,
      'true'
    );
    throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_TRANSACTION_ERROR, undefined, {});
  }
};

const generateTransactions = async (
  invoiceDetails: MedicineOrderInvoice[],
  patient: Patient,
  mobileNumber: string,
  order: MedicineOrders
) => {
  let transactions: OneApollTransaction[] = [];
  let index = 0;
  const totalInvoices = invoiceDetails.length;
  return processInvoices(invoiceDetails[index]);
  async function processInvoices(val: MedicineOrderInvoice) {
    const itemDetails = JSON.parse(val.itemDetails);
    let { transactionLineItemsPartial, totalDiscount, netAmount, itemSku } = createLineItems(
      itemDetails
    );

    const itemTypemap = await getSkuMap(itemSku);
    const oneApollo = new OneApollo();
    const oneApolloRes = await oneApollo.getOneApolloUser(mobileNumber);
    let userTier: Tier = Tier.Silver;
    if (oneApolloRes.Success) {
      userTier = oneApolloRes.CustomerData.Tier as Tier;
    }
    let transactionLineItems = addProductNameAndCat(transactionLineItemsPartial, itemTypemap);
    const healthCreditsRedeemed = +new Decimal(
      order.medicineOrderPayments[0].healthCreditsRedeemed
    ).toDecimalPlaces(2, Decimal.ROUND_DOWN);
    const transactionLineItemsCom = updateCreditsRedeemedInfo(
      transactionLineItems,
      healthCreditsRedeemed,
      itemTypemap,
      userTier
    );
    netAmount = transactionLineItemsCom.reduce((acc, curValue) => {
      return acc + curValue.NetAmount;
    }, 0);
    const billDetails: BillDetails = JSON.parse(val.billDetails);
    const transaction: OneApollTransaction = {
      Gender: patient.gender,
      BU: process.env.ONEAPOLLO_BUSINESS_UNIT || '',
      SendCommunication: true,
      CalculateHealthCredits: true,
      MobileNumber: mobileNumber,
      CreditsRedeemed: healthCreditsRedeemed,
      BillNo: `${billDetails.billNumber}_${order.orderAutoId}`,
      NetAmount: netAmount,
      TransactionDate: billDetails.billDateTime,
      GrossAmount: +new Decimal(netAmount).plus(totalDiscount).plus(healthCreditsRedeemed),
      Discount: totalDiscount,
      TransactionLineItems: transactionLineItemsCom,
      StoreCode: getStoreCodeFromDevice(order.deviceType, order.bookingSource),
    };
    transactions.push(transaction);
    index++;
    if (invoiceDetails[index]) {
      processInvoices(invoiceDetails[index]);
    } else {
      return transactions;
    }
  }
};

const getStoreCodeFromDevice = (
  deviceType: MedicineOrders['deviceType'],
  bookingSource: MedicineOrders['bookingSource']
) => {
  let storeCode = ONE_APOLLO_STORE_CODE.WEBCUS;
  if (bookingSource == BOOKING_SOURCE.MOBILE) {
    if (deviceType == DEVICE_TYPE.ANDROID) {
      storeCode = ONE_APOLLO_STORE_CODE.ANDCUS;
    } else {
      storeCode = ONE_APOLLO_STORE_CODE.IOSCUS;
    }
  }
  return storeCode;
};

const addProductNameAndCat = (
  transactionLineItems: TransactionLineItemsPartial[],
  itemTypemap: ItemsSkuTypeMap
): TransactionLineItems[] => {
  const transactionLineItemsComplete: TransactionLineItems[] = [];
  transactionLineItems.forEach((val, i, arr) => {
    const productType = itemTypemap[val.ProductCode].toLowerCase();
    let productName = ProductTypes.PHARMA;
    let ProductCategory = ONE_APOLLO_PRODUCT_CATEGORY.PHARMA;
    switch (productType) {
      case 'fmcg':
        productName = ProductTypes.FMCG;
        ProductCategory = ONE_APOLLO_PRODUCT_CATEGORY.NON_PHARMA;
        break;
      case 'pl':
        productName = ProductTypes.PL;
        ProductCategory = ONE_APOLLO_PRODUCT_CATEGORY.PRIVATE_LABEL;
        break;
    }
    transactionLineItemsComplete.push({
      ...arr[i],
      ProductName: productName,
      ProductCategory: ProductCategory,
    });
  });

  return transactionLineItemsComplete;
};

const getSkuMap = async (itemSku: string[]) => {
  const itemTypemap: ItemsSkuTypeMap = {};

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
    `EXTERNAL_API_CALL_PHARMACY: ${skusInfoUrl}`,
    'createOneApolloTransaction()->API_CALL_STARTING',
    JSON.stringify(pharmaResponse),
    ''
  );
  if (!pharmaResponse) {
    throw new AphError(AphErrorMessages.PHARMACY_SKU_FETCH_FAILED, undefined, {});
  }
  if (!pharmaResponse.productdp)
    throw new AphError(AphErrorMessages.INVALID_RESPONSE_FOR_SKU_PHARMACY, undefined, {});
  pharmaResponse.productdp.forEach((val) => {
    if (val.type_id) {
      itemTypemap[val.sku] = val.type_id;
    } else {
      throw new AphError(AphErrorMessages.PHARMACY_SKU_NOT_FOUND, undefined, {});
    }
  });

  return itemTypemap;
};

const createLineItems = (itemDetails: Array<ItemDetails>) => {
  const itemSku: string[] = [];
  let netAmount: number = 0;
  let totalDiscount: number = 0;
  let transactionLineItemsPartial: TransactionLineItemsPartial[] = [];
  itemDetails.forEach((item: ItemDetails) => {
    itemSku.push(item.itemId);
    const netMrp = Number(new Decimal(item.mrp).times(item.issuedQty).toFixed(2));
    let netDiscount = 0;
    if (item.discountPrice) {
      netDiscount = Number(new Decimal(item.discountPrice).times(item.issuedQty).toFixed(2));
    }
    const netPrice: number = +new Decimal(netMrp).minus(netDiscount);

    totalDiscount = +new Decimal(netDiscount).plus(totalDiscount);
    netAmount = +new Decimal(netPrice).plus(netAmount);
    transactionLineItemsPartial.push({
      ProductCode: item.itemId,
      NetAmount: netPrice,
      GrossAmount: netMrp,
      DiscountAmount: netDiscount,
    });
  });
  return {
    transactionLineItemsPartial,
    totalDiscount,
    netAmount,
    itemSku,
  };
};

const updateCreditsRedeemedInfo = (
  transactionLineItems: TransactionLineItems[],
  totalCreditsRedeemed: number,
  itemTypemap: ItemsSkuTypeMap,
  userTier: Tier
): TransactionLineItems[] => {
  let availableCredits = totalCreditsRedeemed;
  const arrSize = transactionLineItems.length;
  for (let i = 0; i < arrSize; i++) {
    let currentItem = Object.assign({}, transactionLineItems[i]);
    if (currentItem.ProductCode) {
      const currentProductCode: ProductTypePharmacy = itemTypemap[
        currentItem.ProductCode
      ].toLowerCase() as ProductTypePharmacy;
      let earningCurrentItem = projectedEarnings(
        currentProductCode,
        currentItem.NetAmount,
        currentItem.DiscountAmount,
        userTier
      );
      for (let j = i + 1; j < arrSize; j++) {
        if (!availableCredits) {
          break;
        }
        const iterationItem = Object.assign({}, transactionLineItems[j]);
        const iterationProductCode: ProductTypePharmacy = itemTypemap[
          iterationItem.ProductCode
        ].toLowerCase() as ProductTypePharmacy;
        const earningIterationItem = projectedEarnings(
          iterationProductCode,
          iterationItem.NetAmount,
          iterationItem.DiscountAmount,
          userTier
        );

        if (earningCurrentItem > earningIterationItem) {
          transactionLineItems[i] = Object.assign({}, iterationItem);
          transactionLineItems[j] = Object.assign({}, currentItem);
          currentItem = transactionLineItems[i];
          earningCurrentItem = earningIterationItem;
        }
      }

      const pointsRedeemed =
        currentItem.NetAmount > availableCredits ? availableCredits : currentItem.NetAmount;
      availableCredits = +new Decimal(availableCredits).minus(pointsRedeemed);
      transactionLineItems[i].PointsRedeemed = pointsRedeemed;

      transactionLineItems[i].NetAmount = +new Decimal(currentItem.NetAmount).minus(pointsRedeemed);
    }
  }
  if (availableCredits) {
    transactionLineItems[arrSize - 1].PointsRedeemed = availableCredits;
  }
  return transactionLineItems;
};

const projectedEarnings = (
  type: ProductTypePharmacy,
  netAmount: number,
  discount: number,
  tier: Tier
): number => {
  const oneApollo = new OneApollo();
  const earnings = oneApollo.getOneApolloTierInfo();
  let tierEarnings = earnings[tier];
  if (!tierEarnings) {
    tierEarnings = earnings.Silver;
  }
  return discount ? 0 : +new Decimal(netAmount).times(tierEarnings[type]);
};

export const updateOrderStatusResolvers = {
  Mutation: {
    updateOrderStatus,
  },
};
