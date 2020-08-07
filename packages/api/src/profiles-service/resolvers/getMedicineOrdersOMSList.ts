/* eslint-disable @typescript-eslint/no-explicit-any */
import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  MedicineOrders,
  MEDICINE_ORDER_STATUS,
  MEDICINE_ORDER_TYPE,
  MEDICINE_DELIVERY_TYPE,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getUnixTime, format } from 'date-fns';
import { hgetAllCache, hmsetCache } from 'profiles-service/database/connectRedis';
import { ApiConstants } from 'ApiConstants';
import { log } from 'customWinstonLogger';

const path = require('path');

export const getMedicineOrdersOMSListTypeDefs = gql`
  type MedicineOrdersOMSListResult {
    meta: PaginateMetaDataOMS
    medicineOrdersList: [MedicineOrdersOMS]
  }

  type PaginateMetaDataOMS {
    total: Int
    pageSize: Int
    pageNo: Int
  }

  type getMedicineOrdersListResult {
    updatedSkus: [String]
  }

  type MedicineOrderOMSDetailsResult {
    medicineOrderDetails: MedicineOrdersOMS
  }

  type MedicineOrdersOMS {
    id: ID!
    orderAutoId: Int
    quoteId: String
    shopId: String
    shopAddress: String
    estimatedAmount: Float
    patientId: ID!
    deliveryType: MEDICINE_DELIVERY_TYPE!
    patientAddressId: ID
    quoteDateTime: DateTime
    createdDate: DateTime
    coupon: String
    devliveryCharges: Float
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    pharmaRequest: String
    orderTat: String
    couponDiscount: Float
    productDiscount: Float
    packagingCharges: Float
    redeemedAmount: Float
    showPrescriptionAtStore: Boolean
    billNumber: String
    orderType: MEDICINE_ORDER_TYPE
    currentStatus: MEDICINE_ORDER_STATUS
    bookingSource: BOOKING_SOURCE
    medicineOrderLineItems: [MedicineOrderOMSLineItems]
    medicineOrderPayments: [MedicineOrderOMSPayments]
    medicineOrderRefunds: [MedicineOrderOMSRefunds]
    medicineOrdersStatus: [MedicineOrdersOMSStatus]
    medicineOrderShipments: [MedicineOrderOMSShipment]
    medicineOrderAddress: MedicineOrderOMSAddress
    patient: Patient
    customerComment: String
    alertStore: Boolean
  }

  type MedicineOrderOMSLineItems {
    medicineSKU: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
    isPrescriptionNeeded: Int
    mou: Int
    isMedicine: String
  }

  type MedicineOrderOMSShipment {
    id: ID!
    siteId: String
    siteName: String
    apOrderNo: String
    updatedDate: String
    currentStatus: MEDICINE_ORDER_STATUS
    itemDetails: String
    medicineOrdersStatus: [MedicineOrdersOMSStatus]
    medicineOrderInvoice: [MedicineOrderOMSInvoice]
  }

  type MedicineOrderOMSInvoice {
    id: ID!
    siteId: String
    remarks: String
    requestType: String
    vendorName: String
    billDetails: String
    itemDetails: String
  }

  type MedicineOrdersOMSStatus {
    id: ID!
    orderStatus: MEDICINE_ORDER_STATUS
    statusDate: DateTime
    statusMessage: String
    customReason: String
    hideStatus: Boolean
  }

  type MedicineOrderOMSPayments {
    id: ID!
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE
    amountPaid: Float
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: Date
    responseCode: String
    responseMessage: String
    bankTxnId: String
    healthCreditsRedeemed: Float
    healthCreditsRedemptionRequest: BlockUserPointsResponse
    paymentMode: PAYMENT_METHODS_REVERSE
    refundAmount: Float
  }

  type MedicineOrderOMSRefunds {
    refundAmount: Float
    refundStatus: REFUND_STATUS
    refundId: String
    orderId: String
    createdDate: DateTime
  }

  enum REFUND_STATUS {
    REFUND_REQUEST_RAISED
    REFUND_FAILED
    REFUND_SUCCESSFUL
    REFUND_REQUEST_NOT_RAISED
  }

  enum PAYMENT_METHODS_REVERSE {
    DEBIT_CARD
    CREDIT_CARD
    NET_BANKING
    PAYTM_WALLET
    CREDIT_CARD_EMI
    UPI
    PAYTM_POSTPAID
    COD
  }

  type BlockUserPointsResponse {
    Success: Boolean
    Message: String
    RequestNumber: String
    AvailablePoints: Float
    BalancePoints: Float
    RedeemedPoints: Float
    PointsValue: Float
  }

  type MedicineOrderOMSAddress {
    id: ID
    name: String
    mobileNumber: String
    addressLine1: String
    addressLine2: String
    addressType: PATIENT_ADDRESS_TYPE
    city: String
    otherAddressType: String
    state: String
    zipcode: String
    landmark: String
    latitude: Float
    longitude: Float
    statecode: String
  }

  type RecommendedProductsListResult {
    recommendedProducts: [RecommendedProducts]
  }

  type RecommendedProducts {
    productSku: String
    productName: String
    productImage: String
    productPrice: String
    productSpecialPrice: String
    isPrescriptionNeeded: String
    categoryName: String
    status: String
    mou: String
    imageBaseUrl: String
    id: String
    is_in_stock: Boolean
    small_image: String
    thumbnail: String
    type_id: String
    quantity: String
    isShippable: String
    MaxOrderQty: Int
    urlKey: String
  }

  type ProductAvailabilityResult {
    productAvailabilityList: [ProductAvailability]
  }

  type ProductAvailability {
    productSku: String
    status: Boolean
    quantity: String
  }

  extend type Query {
    getMedicineOrdersOMSList(
      patientId: String
      pageNo: Int
      pageSize: Int
    ): MedicineOrdersOMSListResult!
    getMedicineOrderOMSDetails(
      patientId: String
      orderAutoId: Int
      billNumber: String
    ): MedicineOrderOMSDetailsResult!
    getMedicineOMSPaymentOrder(pageNo: Int, pageSize: Int): MedicineOrdersOMSListResult!
    getRecommendedProductsList(patientUhid: String!): RecommendedProductsListResult!
    checkIfProductsOnline(productSkus: [String]): ProductAvailabilityResult!
    updateMedicineDataRedis(limit: Int, offset: Int): getMedicineOrdersListResult
    getLatestMedicineOrder(patientUhid: String!): MedicineOrderOMSDetailsResult!
    getMedicineOrderOMSDetailsWithAddress(
      patientId: String
      orderAutoId: Int
      billNumber: String
    ): MedicineOrderOMSDetailsResult!
  }
`;

type getMedicineOrdersListResult = {
  updatedSkus: string[];
};

type PaginateMetaDataOMS = {
  total: number | null;
  pageSize: number | null;
  pageNo: number | null;
};

type MedicineOrdersOMSListResult = {
  meta: PaginateMetaDataOMS;
  medicineOrdersList: MedicineOrders[];
};

type MedicineOrderOMSDetailsResult = {
  medicineOrderDetails: MedicineOrders;
};

type RecommendedProductsListResult = {
  recommendedProducts: RecommendedProducts[];
};

type RecommendedProducts = {
  productSku: string;
  productName: string;
  productImage: string;
  productPrice: string;
  productSpecialPrice: string;
  isPrescriptionNeeded: string;
  categoryName: string;
  status: string;
  mou: string;
  imageBaseUrl: string;
  urlKey: string;
  description: string;
  id: string;
  is_in_stock: boolean;
  small_image: string;
  thumbnail: string;
  type_id: string;
  quantity: string;
  isShippable: string;
  MaxOrderQty: number;
};

type ProductAvailabilityResult = {
  productAvailabilityList: ProductAvailability[];
};

type ProductAvailability = {
  productSku: string;
  status: boolean;
  quantity: string;
};

const getMedicineOrdersOMSList: Resolver<
  null,
  { patientId: string; orderAutoId?: number; pageNo?: number; pageSize?: number },
  ProfilesServiceContext,
  MedicineOrdersOMSListResult
> = async (parent, args, { profilesDb, mobileNumber }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(args.patientId);
  // paginated vars
  const { pageNo, pageSize = 10 } = args; //default pageSize = 10
  const paginateParams: { take?: number; skip?: number } = {};

  log(
    'profileServiceLogger',
    `getMedicineOrdersOMSList:${mobileNumber}`,
    'getMedicineOrdersOMSList',
    JSON.stringify(patientDetails),
    ''
  );

  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  if (mobileNumber != patientDetails.mobileNumber) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }
  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientDetails });
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  //pageNo should be greater than 0
  if (pageNo === 0) {
    throw new AphError(AphErrorMessages.PAGINATION_PARAMS_PAGENO_ERROR, undefined, {});
  }

  let medicineOrdersList = await medicineOrdersRepo.getMedicineOrdersListWithoutAbortedStatus(primaryPatientIds);

  //to know later if medicineOrderList is updated or not
  const saveCount = medicineOrdersList.length;

  let uhid = patientDetails.uhid;
  if (process.env.NODE_ENV == 'local') uhid = ApiConstants.CURRENT_UHID.toString();
  else if (process.env.NODE_ENV == 'dev') uhid = ApiConstants.CURRENT_UHID.toString();

  if (uhid) {
    log(
      'profileServiceLogger',
      `PRISM_GET_OFFLINE_ORDERS:${uhid}`,
      'getMedicineOrdersOMSList',
      mobileNumber,
      ''
    );

    const ordersResp = await fetch(
      process.env.PRISM_GET_OFFLINE_ORDERS ? process.env.PRISM_GET_OFFLINE_ORDERS + uhid : '',
      {
        method: 'GET',
        headers: {},
      }
    );
    log(
      'profileServiceLogger',
      `PRISM_GET_OFFLINE_ORDERS_RESP:${uhid}`,
      'getMedicineOrdersOMSList',
      JSON.stringify(ordersResp),
      ''
    );
    const textRes = await ordersResp.text();
    const offlineOrdersList = JSON.parse(textRes);
    log(
      'profileServiceLogger',
      `PRISM_GET_OFFLINE_ORDERS_RESP:${uhid}`,
      'getMedicineOrdersOMSList',
      JSON.stringify(offlineOrdersList),
      ''
    );
    if (offlineOrdersList.errorCode == 0) {
      offlineOrdersList.response.forEach((order: any) => {
        const lineItems: any[] = [];
        if (order.lineItems) {
          order.lineItems.forEach((item: any) => {
            const itemDets = {
              isMedicine: 1,
              medicineSKU: item.itemId,
              medicineName: item.itemName,
              mrp: item.mrp,
              mou: 1,
              price: item.totalMrp,
              quantity: item.saleQty,
              isPrescriptionNeeded: 0,
            };
            lineItems.push(itemDets);
          });
        }
        const offlineShopAddress = {
          storename: order.siteName,
          address: order.address,
          workinghrs: '24 Hrs',
          phone: order.mobileNo,
          city: order.city,
          state: order.state,
          zipcode: '500033',
          stateCode: 'TS',
        };
        const offlineList: any = {
          id: ApiConstants.OFFLINE_ORDERID,
          orderAutoId: order.id,
          shopAddress: JSON.stringify(offlineShopAddress),
          createdDate:
            format(getUnixTime(order.billDateTime) * 1000, 'yyyy-MM-dd') +
            'T' +
            format(getUnixTime(order.billDateTime) * 1000, 'hh:mm:ss') +
            '.000Z',
          billNumber: order.billNo,
          medicineOrderLineItems: lineItems,
          currentStatus: MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE,
          orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
          patientId: args.patientId,
          deliveryType: MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
          estimatedAmount: order.mrpTotal,
          productDiscount: order.discountTotal,
          redeemedAmount: order.giftTotal,
          medicineOrdersStatus: [
            {
              id: ApiConstants.OFFLINE_ORDERID,
              statusDate:
                format(getUnixTime(order.billDateTime) * 1000, 'yyyy-MM-dd') +
                'T' +
                format(getUnixTime(order.billDateTime) * 1000, 'hh:mm:ss') +
                '.000Z',
              orderStatus: MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE,
              hideStatus: true,
            },
          ],
          medicineOrderShipments: [],
        };
        //offlineList.push(orderDetails)
        medicineOrdersList.push(offlineList);
      });
    }
  }

  function GetSortOrder(a: MedicineOrders, b: MedicineOrders) {
    return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
  }
  // console.log('checking medicineOrdersList length if mutate --->', saveCount, medicineOrdersList.length)

  // needs to sort bcoz of updated medicineOrdersList orders
  if (saveCount != medicineOrdersList.length) {
    medicineOrdersList.sort(GetSortOrder);
  }


  // record total count
  const totalCount = medicineOrdersList.length

  // paginate data
  if (pageNo) {
    paginateParams.take = pageSize
    paginateParams.skip = (pageSize * pageNo) - pageSize //bcoz pageNo. starts from 1 not 0.
    medicineOrdersList = medicineOrdersList.slice(paginateParams.skip).slice(0, paginateParams.take)
  }

  return {
    meta: {
      pageNo: pageNo || null,
      pageSize: (Number.isInteger(pageNo) && pageSize) || null,
      total: (Number.isInteger(pageNo) && totalCount) || null,
    },
    medicineOrdersList,
  };
};

const getMedicineOrderOMSDetails: Resolver<
  null,
  { patientId: string; orderAutoId: number; billNumber: string },
  ProfilesServiceContext,
  MedicineOrderOMSDetailsResult
> = async (parent, args, { profilesDb }) => {
  let medicineOrderDetails: any = '';
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  if (args.billNumber && args.billNumber != '' && args.billNumber != '0' && args.patientId) {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    const patientDetails = await patientRepo.getPatientDetails(args.patientId);
    if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    const uhid = patientDetails.uhid;

    medicineOrderDetails = await medicineOrdersRepo.getOfflineOrderDetails(
      args.patientId,
      uhid,
      args.billNumber
    );

    if (medicineOrderDetails == '' || medicineOrderDetails == null) {
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
    }
  } else {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    if (args.patientId) {
      const patientDetails = await patientRepo.getPatientDetails(args.patientId);
      if (!patientDetails) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
      }
    }
    //let medicineOrderDetails;
    if (!args.patientId) {
      medicineOrderDetails = await medicineOrdersRepo.getMedicineOrderDetailsByOderId(
        args.orderAutoId
      );
    } else {
      medicineOrderDetails = await medicineOrdersRepo.getMedicineOrderById(
        args.patientId,
        args.orderAutoId
      );
    }
    if (!medicineOrderDetails) {
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
    }
    if (medicineOrderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
      const reasonCode = medicineOrderDetails.medicineOrdersStatus.find((orderStatusObj: any) => {
        return orderStatusObj.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED;
      });
      if (reasonCode) {
        try {
          const cancellationReasons = await medicineOrdersRepo.getMedicineOrderCancelReasonByCode(
            reasonCode.statusMessage
          );
          if (cancellationReasons) {
            reasonCode.statusMessage = cancellationReasons.displayMessage;
          } else {
            reasonCode.statusMessage = '';
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
    medicineOrderDetails.medicineOrdersStatus.sort((a: any, b: any) => {
      return getUnixTime(new Date(a.statusDate)) - getUnixTime(new Date(b.statusDate));
    });
  }
  return { medicineOrderDetails };
};

const getMedicineOMSPaymentOrder: Resolver<
  null,
  { pageNo?: number; pageSize?: number }, //for consistency response though not mandatory
  ProfilesServiceContext,
  MedicineOrdersOMSListResult
> = async (parent, args, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  // paginated vars
  const { pageNo, pageSize = 10 } = args; //default pageSize = 10
  const paginateParams: { take?: number; skip?: number } = {};
  //pageNo should be greater than 0
  if (pageNo === 0) {
    throw new AphError(AphErrorMessages.PAGINATION_PARAMS_PAGENO_ERROR, undefined, {});
  }
  if (pageNo) {
    paginateParams.take = pageSize;
    paginateParams.skip = pageSize * pageNo - pageSize; //bcoz pageNo. starts from 1 not 0.
  }
  const [medicineOrdersList, totalCount] = await medicineOrdersRepo.getPaymentMedicineOrders(
    paginateParams
  );
  //meta added for consistency response
  return {
    meta: {
      pageNo: pageNo || null,
      pageSize: (Number.isInteger(pageNo) && pageSize) || null,
      total: (Number.isInteger(pageNo) && totalCount) || null,
    },
    medicineOrdersList,
  };
};

const getRecommendedProductsList: Resolver<
  null,
  { patientUhid: string },
  ProfilesServiceContext,
  RecommendedProductsListResult
> = async (parent, args, { profilesDb }) => {
  let uhid = args.patientUhid;
  if (process.env.NODE_ENV == 'local') uhid = ApiConstants.CURRENT_UHID.toString();
  else if (process.env.NODE_ENV == 'dev') uhid = ApiConstants.CURRENT_UHID.toString();
  //const redisKeys = await tedis.keys('*');
  //uhid = 'APJ1.0002558515';
  const recommendedProductsList: RecommendedProducts[] = [];
  const listResp = await fetch(
    process.env.PRISM_GET_RECOMMENDED_PRODUCTS
      ? process.env.PRISM_GET_RECOMMENDED_PRODUCTS + uhid
      : '',
    {
      method: 'GET',
      headers: {},
    }
  );
  const textRes = await listResp.text();
  const productsList = JSON.parse(textRes);
  if (productsList.errorCode == 0) {
    for (let k = 0; k < productsList.response.recommendations.length; k++) {
      //console.log(productsList.response[k], 'redis keys length');
      const key = 'medicine:sku:' + productsList.response.recommendations[k];
      const skuDets = await hgetAllCache(key);
      if (skuDets && skuDets.status == 'Enabled') {
        const recommendedProducts: RecommendedProducts = {
          productImage: decodeURIComponent(skuDets.gallery_images),
          productPrice: skuDets.price,
          productName: decodeURIComponent(skuDets.name),
          productSku: skuDets.sku,
          productSpecialPrice: skuDets.special_price,
          isPrescriptionNeeded: skuDets.is_prescription_required,
          categoryName: decodeURIComponent(skuDets.category_name),
          status: skuDets.status,
          mou: skuDets.mou,
          imageBaseUrl: ApiConstants.REDIS_IMAGE_URL.toString(),
          urlKey: skuDets.url_key,
          description: skuDets.description,
          id: '',
          is_in_stock: true,
          small_image: skuDets.base_image,
          thumbnail: skuDets.base_image,
          type_id: '',
          quantity: skuDets.qty,
          isShippable: skuDets.sell_online,
          MaxOrderQty: 0,
        };
        recommendedProductsList.push(recommendedProducts);
      }
    }
  }

  return { recommendedProducts: recommendedProductsList };
};

const checkIfProductsOnline: Resolver<
  null,
  { productSkus: string[] },
  ProfilesServiceContext,
  ProductAvailabilityResult
> = async (parent, args, { profilesDb }) => {
  //const redisKeys = await tedis.keys('*');
  async function checkProduct(sku: string) {
    return new Promise<ProductAvailability>(async (resolve) => {
      const key = 'medicine:sku:' + sku;
      const skuDets = await hgetAllCache(key);
      const product: ProductAvailability = {
        productSku: sku,
        status: false,
        quantity: '0',
      };
      if (skuDets && skuDets.status == 'Enabled') {
        product.status = true;
        product.quantity = skuDets.qty;
      }
      productAvailability.push(product);
      resolve(product);
    });
  }
  const promises: object[] = [];
  const productAvailability: ProductAvailability[] = [];
  if (args.productSkus.length > 0) {
    args.productSkus.forEach(async (sku) => {
      promises.push(checkProduct(sku));
    });
  }
  await Promise.all(promises);
  return { productAvailabilityList: productAvailability };
};
const updateMedicineDataRedis: Resolver<
  null,
  { limit: number; offset: number },
  ProfilesServiceContext,
  getMedicineOrdersListResult
> = async (parent, args, context) => {
  const excelToJson = require('convert-excel-to-json');
  let fileDirectory = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    fileDirectory = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  console.log(fileDirectory + '/Online_Master.xlsx');

  const rowData = excelToJson({
    sourceFile: fileDirectory + '/Online_Master.xlsx',
    sheets: [
      {
        name: 'Sheet1',
        header: {
          rows: 1,
        },
        columnToKey: {
          A: 'sku',
          B: 'name',
          C: 'status',
          D: 'price',
          E: 'special_price',
          F: 'special_price_from',
          G: 'special_price_to',
          H: 'qty',
          I: 'description',
          J: 'url_key',
          K: 'base_image',
          L: 'is_prescription_required',
          M: 'category_name',
          N: 'product_discount_category',
          O: 'sell_online',
          P: 'molecules',
          Q: 'manufacturer',
          R: 'mou',
          S: 'gallery_images',
        },
      },
    ],
  });
  const updatedSkus: string[] = [];
  for (let k = args.offset; k <= args.offset + args.limit - 1; k++) {
    const skuKey = 'medicine:sku:' + rowData.Sheet1[k].sku;
    await hmsetCache(skuKey, {
      sku: encodeURIComponent(rowData.Sheet1[k].sku),
      name: encodeURIComponent(rowData.Sheet1[k].name),
      status: encodeURIComponent(rowData.Sheet1[k].status),
      price: encodeURIComponent(rowData.Sheet1[k].price),
      special_price:
        rowData.Sheet1[k].special_price != undefined
          ? encodeURIComponent(rowData.Sheet1[k].special_price)
          : '',
      special_price_from:
        rowData.Sheet1[k].special_price_from != undefined
          ? encodeURIComponent(rowData.Sheet1[k].special_price_from)
          : '',
      special_price_to:
        rowData.Sheet1[k].special_price_to != undefined
          ? encodeURIComponent(rowData.Sheet1[k].special_price_to)
          : '',
      qty: encodeURIComponent(rowData.Sheet1[k].qty),
      description: encodeURIComponent(rowData.Sheet1[k].description),
      url_key: encodeURIComponent(rowData.Sheet1[k].url_key),
      base_image: encodeURIComponent(rowData.Sheet1[k].base_image),
      is_prescription_required: encodeURIComponent(rowData.Sheet1[k].is_prescription_required),
      category_name: encodeURIComponent(rowData.Sheet1[k].category_name),
      product_discount_category: encodeURIComponent(rowData.Sheet1[k].product_discount_category),
      sell_online: encodeURIComponent(rowData.Sheet1[k].sell_online),
      molecules:
        rowData.Sheet1[k].molecules != undefined
          ? encodeURIComponent(rowData.Sheet1[k].molecules)
          : '',
      mou: encodeURIComponent(rowData.Sheet1[k].mou),
      gallery_images: encodeURIComponent(rowData.Sheet1[k].gallery_images),
      manufacturer: encodeURIComponent(rowData.Sheet1[k].manufacturer),
    });
    if (!updatedSkus.includes(rowData.Sheet1[k].sku)) {
      updatedSkus.push(rowData.Sheet1[k].sku);
    }
  }
  return { updatedSkus: updatedSkus };
};

const getLatestMedicineOrder: Resolver<
  null,
  { patientUhid: string },
  ProfilesServiceContext,
  MedicineOrderOMSDetailsResult
> = async (parent, args, { profilesDb, mobileNumber }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findByUhid(args.patientUhid);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (mobileNumber != patientDetails.mobileNumber) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }
  let uhid = args.patientUhid;
  if (process.env.NODE_ENV == 'local') uhid = ApiConstants.CURRENT_UHID.toString();
  else if (process.env.NODE_ENV == 'dev') uhid = ApiConstants.CURRENT_UHID.toString();

  const listResp = await fetch(
    process.env.PRISM_GET_RECOMMENDED_PRODUCTS
      ? process.env.PRISM_GET_RECOMMENDED_PRODUCTS + uhid
      : '',
    {
      method: 'GET',
      headers: {},
    }
  );
  const textRes = await listResp.text();
  const latestBillResp = JSON.parse(textRes);
  //console.log('productsList===>', response, response.response.latestBill);
  let offlineList: any = '';
  if (latestBillResp.errorCode == 0 && latestBillResp.response.latestBill) {
    const orderDets = latestBillResp.response.latestBill;
    const lineItems: any[] = [];
    if (orderDets.lineItems) {
      orderDets.lineItems.forEach((item: any) => {
        const itemDets = {
          isMedicine: 1,
          medicineSKU: item.itemId,
          medicineName: item.itemName,
          mrp: item.mrp,
          mou: 1,
          price: item.totalMrp,
          quantity: item.saleQty,
          isPrescriptionNeeded: 0,
        };
        lineItems.push(itemDets);
      });
    }
    const offlineShopAddress = {
      storename: orderDets.siteName,
      address: orderDets.address,
      workinghrs: '24 Hrs',
      phone: orderDets.mobileNo,
      city: orderDets.city,
      state: orderDets.state,
      zipcode: '500033',
      stateCode: 'TS',
    };
    offlineList = {
      id: ApiConstants.OFFLINE_ORDERID,
      orderAutoId: orderDets.id,
      shopAddress: JSON.stringify(offlineShopAddress),
      createdDate:
        format(getUnixTime(orderDets.billDateTime) * 1000, 'yyyy-MM-dd') +
        'T' +
        format(getUnixTime(orderDets.billDateTime) * 1000, 'hh:mm:ss') +
        '.000Z',
      billNumber: orderDets.billNo,
      medicineOrderLineItems: lineItems,
      currentStatus: MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE,
      orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
      patientId: patientDetails.id,
      deliveryType: MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
      estimatedAmount: orderDets.mrpTotal,
      productDiscount: orderDets.discountTotal,
      redeemedAmount: orderDets.giftTotal,
      medicineOrdersStatus: [
        {
          id: ApiConstants.OFFLINE_ORDERID,
          statusDate:
            format(getUnixTime(orderDets.billDateTime) * 1000, 'yyyy-MM-dd') +
            'T' +
            format(getUnixTime(orderDets.billDateTime) * 1000, 'hh:mm:ss') +
            '.000Z',
          orderStatus: MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE,
          hideStatus: true,
        },
      ],
      medicineOrderShipments: [],
    };
  }
  //console.log(offlineList, 'offline list');
  if (offlineList == '') {
    const medRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
    offlineList = await medRepo.getLatestMedicineOrderDetails(patientDetails.id);
    //console.log(offlineList, 'offlineList inside');
    if (!offlineList || offlineList == null || offlineList == '')
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  return { medicineOrderDetails: offlineList };
};

const getMedicineOrderOMSDetailsWithAddress: Resolver<
  null,
  { patientId: string; orderAutoId: number; billNumber: string },
  ProfilesServiceContext,
  MedicineOrderOMSDetailsResult
> = async (parent, args, { profilesDb }) => {
  let medicineOrderDetails: any = '';
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  if (args.billNumber && args.billNumber != '' && args.billNumber != '0' && args.patientId) {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    const patientDetails = await patientRepo.getPatientDetails(args.patientId);
    if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    const uhid = patientDetails.uhid;

    medicineOrderDetails = await medicineOrdersRepo.getOfflineOrderDetails(
      args.patientId,
      uhid,
      args.billNumber
    );

    if (medicineOrderDetails == '' || medicineOrderDetails == null) {
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
    }
  } else {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    if (args.patientId) {
      const patientDetails = await patientRepo.getPatientDetails(args.patientId);
      if (!patientDetails) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
      }
    }
    //let medicineOrderDetails;
    medicineOrderDetails = await medicineOrdersRepo.getMedicineOrderDetailsWithAddressByOrderId(
      args.orderAutoId
    );
    if (!medicineOrderDetails) {
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
    }
    if (medicineOrderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
      const reasonCode = medicineOrderDetails.medicineOrdersStatus.find((orderStatusObj: any) => {
        return orderStatusObj.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED;
      });
      if (reasonCode) {
        try {
          const cancellationReasons = await medicineOrdersRepo.getMedicineOrderCancelReasonByCode(
            reasonCode.statusMessage
          );
          if (cancellationReasons) {
            reasonCode.statusMessage = cancellationReasons.displayMessage;
          } else {
            reasonCode.statusMessage = '';
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
    medicineOrderDetails.medicineOrdersStatus.sort((a: any, b: any) => {
      return getUnixTime(new Date(a.statusDate)) - getUnixTime(new Date(b.statusDate));
    });
  }
  return { medicineOrderDetails };
};

export const getMedicineOrdersOMSListResolvers = {
  Query: {
    getMedicineOrdersOMSList,
    getMedicineOrderOMSDetails,
    getMedicineOMSPaymentOrder,
    getRecommendedProductsList,
    checkIfProductsOnline,
    updateMedicineDataRedis,
    getLatestMedicineOrder,
    getMedicineOrderOMSDetailsWithAddress,
  },
};
