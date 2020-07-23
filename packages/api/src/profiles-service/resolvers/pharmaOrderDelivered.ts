import gql from 'graphql-tag';
import { Decimal } from 'decimal.js';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MedicineOrders,
  TransactionLineItems,
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
  NotificationType,
  sendMedicineOrderStatusNotification,
} from 'notifications-service/resolvers/notifications';
import { log } from 'customWinstonLogger';
import { OneApollo } from 'helpers/oneApollo';

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

type PharmaSKUResp = {
  productdp: ProductDP[];
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
  const invoiceDetails = await medicineOrdersRepo.getInvoiceDetailsByOrderId(order.orderAutoId);
  if (!invoiceDetails.length) {
    log(
      'profileServiceLogger',
      `invalid Invoice: $ - ${order.orderAutoId}`,
      'createOneApolloTransaction',
      JSON.stringify(order),
      'true'
    );
    //throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
    return true;
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
  const pharmaResponse = (await pharmaResp.json()) as PharmaSKUResp;
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
