import gql from 'graphql-tag';
import { Decimal } from 'decimal.js';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrderInvoice,
  MedicineOrdersStatus,
  MedicineOrders,
  TransactionLineItems,
  TransactionLineItemsPartial,
  OneApollTransaction,
  ONE_APOLLO_PRODUCT_CATEGORY,
  Patient,
  BOOKING_SOURCE,
  DEVICE_TYPE,
} from 'profiles-service/entities';
import { ONE_APOLLO_STORE_CODE } from 'types/oneApolloTypes';

import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  sendCartNotification,
  sendMedicineOrderStatusNotification,
} from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';
import { log } from 'customWinstonLogger';
import { OneApollo } from 'helpers/oneApollo';
import { PharmaItemsResponse } from 'types/medicineOrderTypes';
import { ApiConstants } from 'ApiConstants';

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

type ProductDP = {
  id: number;
  sku: string;
  price: number;
  name: string;
  status: string;
  type_id: ProductTypes;
  url_key: string;
  is_in_stock: string;
  mou: string;
  is_prescription_required: string;
  Message: string;
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
    mobileNumberIn
  );

  const pushNotificationInput = {
    orderAutoId: orderDetails.orderAutoId,
    notificationType: NotificationType.MEDICINE_ORDER_DELIVERED,
  };
  const notificationResult = sendCartNotification(pushNotificationInput, profilesDb);
  console.log(notificationResult, 'medicine order delivered notification');

  return { requestStatus: 'true', requestMessage: 'Delivery status updated successfully' };
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
      console.log('transactionArr', JSON.stringify(transactionArr));
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
    let transactionLineItems = addProductNameAndCat(transactionLineItemsPartial, itemTypemap);
    const transactionLineItemsCom = updateCreditsRedeemedInfo(
      transactionLineItems,
      +new Decimal(order.medicineOrderPayments[0].healthCreditsRedeemed).toFixed(2),
      itemTypemap
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
      CreditsRedeemed: +new Decimal(order.medicineOrderPayments[0].healthCreditsRedeemed).toFixed(
        2
      ),
      BillNo: `${billDetails.billNumber}_${order.orderAutoId}`,
      NetAmount: netAmount,
      TransactionDate: billDetails.billDateTime,
      GrossAmount: +new Decimal(netAmount)
        .plus(totalDiscount)
        .plus(+new Decimal(order.medicineOrderPayments[0].healthCreditsRedeemed).toFixed(2)),
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
    const netMrp = Number(new Decimal(item.mrp).times(item.issuedQty).toFixed(1));
    let netDiscount = 0;
    if (item.discountPrice) {
      netDiscount = Number(new Decimal(item.discountPrice).times(item.issuedQty).toFixed(1));
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
  itemTypemap: ItemsSkuTypeMap
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
        currentItem.DiscountAmount
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
          iterationItem.DiscountAmount
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
  discount: number
): number => {
  const earningsPerTypes = {
    pharma: ApiConstants.PHARMA_DISCOUNT,
    fmcg: ApiConstants.FMCG_DISCOUNT,
    pl: ApiConstants.PL_DISCOUNT,
  };
  console.log(+new Decimal(netAmount).times(earningsPerTypes[type]));
  return discount ? 0 : +new Decimal(netAmount).times(earningsPerTypes[type]);
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
};
