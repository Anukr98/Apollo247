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
import { Tedis } from 'redis-typescript';
import { ApiConstants } from 'ApiConstants';

export const getMedicineOrdersOMSListTypeDefs = gql`
  type MedicineOrdersOMSListResult {
    medicineOrdersList: [MedicineOrdersOMS]
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
    medicineOrdersStatus: [MedicineOrdersOMSStatus]
    medicineOrderShipments: [MedicineOrderOMSShipment]
    patient: Patient
    customerComment: String
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
    getMedicineOrdersOMSList(patientId: String): MedicineOrdersOMSListResult!
    getMedicineOrderOMSDetails(
      patientId: String
      orderAutoId: Int
      billNumber: String
    ): MedicineOrderOMSDetailsResult!
    getMedicineOMSPaymentOrder: MedicineOrdersOMSListResult!
    getRecommendedProductsList(patientUhid: String!): RecommendedProductsListResult!
    checkIfProductsOnline(productSkus: [String]): ProductAvailabilityResult!
  }
`;

type MedicineOrdersOMSListResult = {
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
  { patientId: string; orderAutoId?: number },
  ProfilesServiceContext,
  MedicineOrdersOMSListResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(args.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(args.patientId);
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrdersList: any = await medicineOrdersRepo.getMedicineOrdersList(primaryPatientIds);
  const ordersResp = await fetch(
    process.env.PRISM_GET_OFFLINE_ORDERS
      ? process.env.PRISM_GET_OFFLINE_ORDERS + ApiConstants.CURRENT_UHID
      : '',
    {
      method: 'GET',
      headers: {},
    }
  );
  const textRes = await ordersResp.text();
  const offlineOrdersList = JSON.parse(textRes);
  console.log(offlineOrdersList.response, offlineOrdersList.response.length, 'offlineOrdersList');
  if (offlineOrdersList.errorCode == 0) {
    //const orderDate = fromUnixTime(offlineOrdersList.response[0].billDateTime)
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
  function GetSortOrder(a: MedicineOrders, b: MedicineOrders) {
    return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
  }
  medicineOrdersList.sort(GetSortOrder);
  return { medicineOrdersList };
};

const getMedicineOrderOMSDetails: Resolver<
  null,
  { patientId: string; orderAutoId: number; billNumber: string },
  ProfilesServiceContext,
  MedicineOrderOMSDetailsResult
> = async (parent, args, { profilesDb }) => {
  let medicineOrderDetails: any = '';
  if (args.billNumber && args.billNumber != '' && args.billNumber != '0') {
    const ordersResp = await fetch(
      process.env.PRISM_GET_OFFLINE_ORDERS
        ? process.env.PRISM_GET_OFFLINE_ORDERS + ApiConstants.CURRENT_UHID
        : '',
      {
        method: 'GET',
        headers: {},
      }
    );
    const textRes = await ordersResp.text();
    const offlineOrdersList = JSON.parse(textRes);
    console.log(offlineOrdersList.response, offlineOrdersList.response.length, 'offlineOrdersList');
    if (offlineOrdersList.errorCode == 0) {
      //const orderDate = fromUnixTime(offlineOrdersList.response[0].billDateTime)
      offlineOrdersList.response.forEach((order: any) => {
        if (order.billNo == args.billNumber) {
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
          medicineOrderDetails = offlineList;
        }
      });
    }
    if (medicineOrderDetails == '' || medicineOrderDetails == null) {
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
    }
  } else {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    if (args.patientId) {
      const patientDetails = await patientRepo.findById(args.patientId);
      if (!patientDetails) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
      }
    }
    const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
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
  {},
  ProfilesServiceContext,
  MedicineOrdersOMSListResult
> = async (parent, args, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrdersList = await medicineOrdersRepo.getPaymentMedicineOrders();
  return { medicineOrdersList };
};

const getRecommendedProductsList: Resolver<
  null,
  { patientUhid: string },
  ProfilesServiceContext,
  RecommendedProductsListResult
> = async (parent, args, { profilesDb }) => {
  const tedis = new Tedis({
    port: <number>ApiConstants.REDIS_PORT,
    host: ApiConstants.REDIS_URL.toString(),
    password: ApiConstants.REDIS_PWD.toString(),
  });
  //const redisKeys = await tedis.keys('*');
  const recommendedProductsList: RecommendedProducts[] = [];
  const listResp = await fetch(
    process.env.PRISM_GET_RECOMMENDED_PRODUCTS
      ? process.env.PRISM_GET_RECOMMENDED_PRODUCTS + ApiConstants.CURRENT_UHID
      : '',
    {
      method: 'GET',
      headers: {},
    }
  );
  const textRes = await listResp.text();
  const productsList = JSON.parse(textRes);
  if (productsList.errorCode == 0) {
    //console.log(productsList.response[0], productsList.response.length, 'prism recommend list');
    for (let k = 0; k < productsList.response.length; k++) {
      //console.log(productsList.response[k], 'redis keys length');
      const skuDets = await tedis.hgetall(productsList.response[k]);
      if (skuDets && skuDets.status == 'Enabled') {
        const recommendedProducts: RecommendedProducts = {
          productImage: skuDets.gallery_images,
          productPrice: skuDets.price,
          productName: skuDets.name,
          productSku: skuDets.sku,
          productSpecialPrice: skuDets.special_price,
          isPrescriptionNeeded: skuDets.is_prescription_required,
          categoryName: skuDets.category_name,
          status: skuDets.status,
          mou: skuDets.mou,
          imageBaseUrl: ApiConstants.REDIS_IMAGE_URL.toString(),
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
  const tedis = new Tedis({
    port: <number>ApiConstants.REDIS_PORT,
    host: ApiConstants.REDIS_URL.toString(),
    password: ApiConstants.REDIS_PWD.toString(),
  });
  //const redisKeys = await tedis.keys('*');
  async function checkProduct(sku: string) {
    return new Promise<ProductAvailability>(async (resolve) => {
      const skuDets = await tedis.hgetall(sku);
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

export const getMedicineOrdersOMSListResolvers = {
  Query: {
    getMedicineOrdersOMSList,
    getMedicineOrderOMSDetails,
    getMedicineOMSPaymentOrder,
    getRecommendedProductsList,
    checkIfProductsOnline,
  },
};
