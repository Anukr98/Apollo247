import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import AbortController from 'abort-controller';

import {
  MedicineOrders,
  Patient,
  MedicineOrderShipments,
  MedicineOrderInvoice,
  DEVICE_TYPE,
  BOOKING_SOURCE,
} from 'profiles-service/entities';
import { OneApollo } from 'helpers/oneApollo';
import { log } from 'customWinstonLogger';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PharmaItemsResponse } from 'types/medicineOrderTypes';

import {
  OneApollTransaction,
  BlockUserPointsResponse,
  UnblockPointsRequest,
  ONE_APOLLO_STORE_CODE,
  TransactionLineItemsPartial,
  TransactionLineItems,
  ONE_APOLLO_PRODUCT_CATEGORY,
  ItemDetails,
} from 'types/oneApolloTypes';
import { Decimal } from 'decimal.js';
import { PharmaProductTypes } from 'ApiConstants';

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
export const createOneApolloTransaction = async (
  medicineOrdersRepo: MedicineOrdersRepository,
  order: MedicineOrders,
  patient: Patient,
  mobileNumber: string,
  apOrderNo: MedicineOrderShipments['apOrderNo']
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
    const oneApollo = new OneApollo();

    const transactionArr = await generateTransactions(
      invoiceDetails,
      patient,
      mobileNumber,
      order,
      oneApollo,
      medicineOrdersRepo
    );
    if (transactionArr) {
      log(
        'profileServiceLogger',
        `oneApollo Transaction Payload- ${order.orderAutoId}`,
        'createOneApolloTransaction()',
        JSON.stringify(transactionArr),
        ''
      );
      const transactionsPromise: Promise<JSON>[] = [];
      transactionArr.forEach((transaction) => {
        medicineOrdersRepo.updateMedicineOrderShipment(
          {
            oneApolloTransaction: transaction,
          },
          apOrderNo
        );
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
  order: MedicineOrders,
  oneApollo: OneApollo,
  medicineOrdersRepo: MedicineOrdersRepository
) => {
  let transactions: OneApollTransaction[] = [];
  let index = 0;
  return processInvoices(invoiceDetails[index]);
  async function processInvoices(val: MedicineOrderInvoice) {
    const itemDetails = JSON.parse(val.itemDetails);
    let { transactionLineItemsPartial, totalDiscount, netAmount, itemSku } = createLineItems(
      itemDetails
    );

    /**
     * For prescription orders, payments info would be missing
     * Assume empty request number and health credits = 0 initially
     */
    let RequestNumber: BlockUserPointsResponse['RequestNumber'] = '';
    let healthCreditsRedeemed: number = 0;

    const itemTypemap = await getSkuMap(itemSku, order.orderAutoId);
    if (order.medicineOrderPayments.length) {
      const paymentInfo = order.medicineOrderPayments[0];
      if (
        paymentInfo.healthCreditsRedemptionRequest &&
        paymentInfo.healthCreditsRedemptionRequest.RequestNumber
      )
        RequestNumber = paymentInfo.healthCreditsRedemptionRequest.RequestNumber;
      healthCreditsRedeemed = +new Decimal(paymentInfo.healthCreditsRedeemed).toDecimalPlaces(
        2,
        Decimal.ROUND_DOWN
      );
    }

    let [actualCreditsRedeemed, transactionLineItems] = addProductNameAndCat(
      transactionLineItemsPartial,
      itemTypemap,
      healthCreditsRedeemed
    );

    const healthCreditsToRefund = +new Decimal(healthCreditsRedeemed).minus(actualCreditsRedeemed);

    if (healthCreditsToRefund > 0) {
      const unblockHCRequest: UnblockPointsRequest = {
        RedemptionRequestNumber: RequestNumber,
        BusinessUnit: process.env.ONEAPOLLO_BUSINESS_UNIT || '',
        MobileNumber: mobileNumber,
        PointsToRelease: '' + healthCreditsToRefund,
        StoreCode: getStoreCodeFromDevice(order.deviceType, order.bookingSource),
      };
      log(
        'profileServiceLogger',
        `oneApollo unblock request - ${order.orderAutoId}`,
        'createOneApolloTransaction()',
        JSON.stringify(unblockHCRequest),
        ''
      );
      await oneApollo.unblockHealthCredits(unblockHCRequest);
      medicineOrdersRepo.updateMedicineOrderPayment(order.id, order.orderAutoId, {
        healthCreditsRedeemed: actualCreditsRedeemed,
      });
    }
    netAmount = transactionLineItems.reduce((acc, curValue) => {
      return +new Decimal(acc).plus(curValue.NetAmount);
    }, 0);
    const billDetails: BillDetails = JSON.parse(val.billDetails);
    const transaction: OneApollTransaction = {
      Gender: patient.gender,
      BU: process.env.ONEAPOLLO_BUSINESS_UNIT || '',
      SendCommunication: true,
      CalculateHealthCredits: true,
      MobileNumber: mobileNumber,
      BillNo: `${billDetails.billNumber}_${order.orderAutoId}`,
      NetAmount: netAmount,
      TransactionDate: billDetails.billDateTime,
      GrossAmount: +new Decimal(netAmount).plus(totalDiscount).plus(actualCreditsRedeemed),
      Discount: totalDiscount,
      TransactionLineItems: transactionLineItems,
      StoreCode: getStoreCodeFromDevice(order.deviceType, order.bookingSource),
    };
    if (actualCreditsRedeemed) {
      transaction.RedemptionRequestNo = RequestNumber;
      transaction.CreditsRedeemed = actualCreditsRedeemed;
    }
    transactions.push(transaction);
    index++;
    if (invoiceDetails[index]) {
      processInvoices(invoiceDetails[index]);
    } else {
      return transactions;
    }
  }
};

export const getStoreCodeFromDevice = (
  deviceType: MedicineOrders['deviceType'],
  bookingSource: MedicineOrders['bookingSource']
) => {
  let storeCode = ONE_APOLLO_STORE_CODE.WEBCUS;
  if (bookingSource == BOOKING_SOURCE.MOBILE) {
    if (deviceType == DEVICE_TYPE.ANDROID) {
      storeCode = ONE_APOLLO_STORE_CODE.ANDCUS;
    } else if (deviceType == DEVICE_TYPE.IOS) {
      storeCode = ONE_APOLLO_STORE_CODE.IOSCUS;
    }
  }

  return storeCode;
};

const addProductNameAndCat = (
  transactionLineItems: TransactionLineItemsPartial[],
  itemTypemap: ItemsSkuTypeMap,
  totalCreditsRedeemed: number
): [number, TransactionLineItems[]] => {
  const fmcgItems: TransactionLineItems[] = [];
  const pharmaItems: TransactionLineItems[] = [];
  const plItems: TransactionLineItems[] = [];
  let availableCredits = totalCreditsRedeemed;
  transactionLineItems.forEach((val, i, arr) => {
    const productType = itemTypemap[val.ProductCode].toLowerCase();
    switch (productType) {
      case 'fmcg':
        let pointsRedeemed = 0;
        if (availableCredits) {
          pointsRedeemed = val.NetAmount > availableCredits ? availableCredits : val.NetAmount;
          let netAmount = +new Decimal(val.NetAmount).minus(pointsRedeemed);
          arr[i].NetAmount = netAmount;
          availableCredits = +new Decimal(availableCredits).minus(pointsRedeemed);
        }
        fmcgItems.push({
          ...arr[i],
          ProductName: ProductTypes.FMCG,
          ProductCategory: ONE_APOLLO_PRODUCT_CATEGORY.NON_PHARMA,
          PointsRedeemed: pointsRedeemed,
        });
        break;
      case 'pl':
        plItems.push({
          ...arr[i],
          ProductName: ProductTypes.PL,
          ProductCategory: ONE_APOLLO_PRODUCT_CATEGORY.PRIVATE_LABEL,
        });
        break;
      case 'pharma':
        pharmaItems.push({
          ...arr[i],
          ProductName: ProductTypes.PHARMA,
          ProductCategory: ONE_APOLLO_PRODUCT_CATEGORY.PHARMA,
        });
        break;
    }
  });
  if (availableCredits && pharmaItems.length) {
    pharmaItems.forEach(_updatePointsNetAmount);
  }

  if (availableCredits && plItems.length) {
    plItems.forEach(_updatePointsNetAmount);
  }

  function _updatePointsNetAmount(
    curItem: TransactionLineItems,
    i: number,
    arr: TransactionLineItems[]
  ) {
    if (availableCredits) {
      let pointsRedeemed =
        curItem.NetAmount > availableCredits ? availableCredits : curItem.NetAmount;
      let netAmount = +new Decimal(curItem.NetAmount).minus(pointsRedeemed);
      availableCredits = +new Decimal(availableCredits).minus(pointsRedeemed);
      arr[i].PointsRedeemed = pointsRedeemed;
      arr[i].NetAmount = netAmount;
    }
  }

  totalCreditsRedeemed = +new Decimal(totalCreditsRedeemed).minus(availableCredits);

  const transactionLineItemsComplete = fmcgItems.concat(pharmaItems, plItems);
  return [totalCreditsRedeemed, transactionLineItemsComplete];
};

const getSkuMap = async (itemSku: string[], orderId: MedicineOrders['orderAutoId']) => {
  let itemTypemap: ItemsSkuTypeMap = {};
  itemSku.forEach((val) => {
    itemTypemap[val] = PharmaProductTypes.FMCG;
  });
  const skusInfoUrl = process.env.PHARMACY_MED_BULK_PRODUCT_INFO_URL || '';
  const authToken = process.env.PHARMACY_MED_AUTH_TOKEN || '';
  const controller = new AbortController();
  const oneApolloTimeout = process.env.ONEAPOLLO_REQUEST_TIMEOUT || 10000;
  const timeout = setTimeout(() => {
    controller.abort();
  }, +oneApolloTimeout);
  try {
    const pharmaResp = await fetch(skusInfoUrl, {
      method: 'POST',
      body: JSON.stringify({
        params: itemSku.join(','),
      }),
      headers: { 'Content-Type': 'application/json', authorization: authToken },
      signal: controller.signal,
    });
    const pharmaResponse = (await pharmaResp.json()) as PharmaItemsResponse;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PHARMACY: ${skusInfoUrl} - ${orderId}`,
      'createOneApolloTransaction()->API_CALL_STARTING',
      JSON.stringify(pharmaResponse),
      ''
    );
    if (!pharmaResponse || !pharmaResponse.productdp) {
      log(
        'profileServiceLogger',
        `EXTERNAL_API_CALL_PHARMACY_FAILED: ${skusInfoUrl} - ${orderId}`,
        'createOneApolloTransaction()->API_CALL_STARTING',
        JSON.stringify(pharmaResponse),
        'true'
      );
    } else {
      pharmaResponse.productdp.forEach((val) => {
        if (val.type_id && itemTypemap[val.sku]) {
          itemTypemap[val.sku] = val.type_id;
        }
      });
    }
  } catch (e) {
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PHARMACY_FAILED_WITH_EXCEPTION: ${skusInfoUrl} - ${orderId}`,
      'createOneApolloTransaction()->API_CALL_STARTING',
      e.stack,
      'true'
    );
  } finally {
    clearTimeout(timeout);
    return itemTypemap;
  }
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
