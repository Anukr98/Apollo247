import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  MedicineOrders,
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_TYPE,
  MedicineOrderLineItems,
  MEDICINE_ORDER_STATUS,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  CouponCategoryApplicable,
  MedicineOrdersStatus,
  MedicineOrderAddress,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import {
  validatePharmaCoupon,
  PharmaOutput,
  PharmaCouponInputArgs,
  OrderLineItems,
} from 'coupons-service/resolvers/validatePharmaCoupon';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { log } from 'customWinstonLogger';
import {
  PharmaItemsResponse,
  StoreInventoryResp,
  PharmaLineItemResult,
  StoreItemDetail,
} from 'types/medicineOrderTypes';
import fetch from 'node-fetch';

export const saveMedicineOrderOMSTypeDefs = gql`
  input MedicineCartOMSInput {
    quoteId: String
    shopId: String
    estimatedAmount: Float
    patientId: ID!
    medicineDeliveryType: MEDICINE_DELIVERY_TYPE!
    bookingSource: BOOKINGSOURCE
    deviceType: DEVICETYPE
    patientAddressId: ID
    devliveryCharges: Float
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    orderTat: String
    items: [MedicineCartOMSItem]
    coupon: String
    couponDiscount: Float
    productDiscount: Float
    packagingCharges: Float
    showPrescriptionAtStore: Boolean
    shopAddress: ShopAddress
    customerComment: String
  }

  enum MEDICINE_DELIVERY_TYPE {
    HOME_DELIVERY
    STORE_PICKUP
  }

  enum MEDICINE_ORDER_TYPE {
    UPLOAD_PRESCRIPTION
    CART_ORDER
  }

  enum MEDICINE_ORDER_STATUS {
    QUOTE
    ORDER_BILLED
    PAYMENT_SUCCESS
    PAYMENT_PENDING
    PAYMENT_FAILED
    ORDER_INITIATED
    ORDER_PLACED
    ORDER_VERIFIED
    DELIVERED
    CANCELLED
    OUT_FOR_DELIVERY
    PICKEDUP
    RETURN_INITIATED
    ITEMS_RETURNED
    RETURN_ACCEPTED
    PRESCRIPTION_UPLOADED
    ORDER_FAILED
    PRESCRIPTION_CART_READY
    ORDER_CONFIRMED
    CANCEL_REQUEST
    READY_AT_STORE
    PURCHASED_IN_STORE
    PAYMENT_ABORTED
  }

  type SaveMedicineOrderResult {
    errorCode: Int
    errorMessage: String
    orderId: ID!
    orderAutoId: Int!
  }

  input ShopAddress {
    storename: String
    address: String
    workinghrs: String
    phone: String
    city: String
    state: String
    zipcode: String
    stateCode: String
  }

  input MedicineCartOMSItem {
    medicineSKU: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
    itemValue: Float
    itemDiscount: Float
    isPrescriptionNeeded: Int
    mou: Int
    isMedicine: String!
    specialPrice: Float!
  }

  extend type Mutation {
    saveMedicineOrderOMS(medicineCartOMSInput: MedicineCartOMSInput): SaveMedicineOrderResult!
  }
`;

export enum customerTypeInCoupons {
  FIRST = 'FIRST',
  RECURRING = 'RECURRING',
}
type MedicineCartOMSInput = {
  quoteId: string;
  shopId: string;
  estimatedAmount: number;
  patientId: string;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  patientAddressId: string;
  devliveryCharges: number;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  orderTat: string;
  bookingSource: BOOKING_SOURCE;
  deviceType: DEVICE_TYPE;
  items: MedicineCartOMSItem[];
  coupon: string;
  couponDiscount: number;
  productDiscount: number;
  packagingCharges: number;
  showPrescriptionAtStore: boolean;
  shopAddress: ShopAddress;
  customerComment: string;
};

type ShopAddress = {
  storename: string;
  address: string;
  workinghrs: string;
  phone: string;
  city: string;
  state: string;
  zipcode: string;
  stateCode: string;
};

type MedicineCartOMSItem = {
  medicineSKU: string;
  medicineName: string;
  itemValue: number;
  itemDiscount: number;
  price: number;
  quantity: number;
  mrp: number;
  isPrescriptionNeeded: number;
  mou: number;
  isMedicine: string;
  specialPrice: number;
};

type SaveMedicineOrderResult = {
  errorCode: number;
  errorMessage: string;
  orderId: string;
  orderAutoId: number;
};

type MedicineCartOMSInputInputArgs = { medicineCartOMSInput: MedicineCartOMSInput };

const saveMedicineOrderOMS: Resolver<
  null,
  MedicineCartOMSInputInputArgs,
  ProfilesServiceContext,
  SaveMedicineOrderResult
> = async (
  parent,
  { medicineCartOMSInput },
  { mobileNumber, profilesDb, doctorsDb, consultsDb }
) => {
  const errorCode = 0,
    errorMessage = '';

  if (!medicineCartOMSInput.items || medicineCartOMSInput.items.length == 0) {
    throw new AphError(AphErrorMessages.CART_EMPTY_ERROR, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(medicineCartOMSInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const deliveryType = medicineCartOMSInput.medicineDeliveryType;
  if (
    deliveryType == MEDICINE_DELIVERY_TYPE.HOME_DELIVERY &&
    !medicineCartOMSInput.patientAddressId
  ) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
  }
  const medicineOrderAddressDetails: Partial<MedicineOrderAddress> = {};
  if (medicineCartOMSInput.patientAddressId) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(
      medicineCartOMSInput.patientAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    } else {
      medicineOrderAddressDetails.addressLine1 = patientAddressDetails.addressLine1;
      medicineOrderAddressDetails.addressLine2 = patientAddressDetails.addressLine2;
      medicineOrderAddressDetails.addressType = patientAddressDetails.addressType;
      medicineOrderAddressDetails.city = patientAddressDetails.city;
      medicineOrderAddressDetails.otherAddressType = patientAddressDetails.otherAddressType;
      medicineOrderAddressDetails.state = patientAddressDetails.state;
      medicineOrderAddressDetails.zipcode = patientAddressDetails.zipcode;
      medicineOrderAddressDetails.landmark = patientAddressDetails.landmark;
      medicineOrderAddressDetails.latitude = patientAddressDetails.latitude;
      medicineOrderAddressDetails.longitude = patientAddressDetails.longitude;
      medicineOrderAddressDetails.stateCode = patientAddressDetails.stateCode;

      if (patientAddressDetails.name) {
        medicineOrderAddressDetails.name = patientAddressDetails.name;
      } else {
        medicineOrderAddressDetails.name = patientDetails.firstName;
      }

      if (patientAddressDetails.mobileNumber) {
        medicineOrderAddressDetails.mobileNumber = patientAddressDetails.mobileNumber;
      } else {
        medicineOrderAddressDetails.mobileNumber = patientDetails.mobileNumber;
      }
    }
  }
  // validate items prices and coupon for web orders
  if (medicineCartOMSInput.bookingSource == BOOKING_SOURCE.WEB) {
    let orderLineItems;
    if (medicineCartOMSInput.shopId) {
      orderLineItems = await validateStoreItems(medicineCartOMSInput);
    } else {
      orderLineItems = await validatePharmaItems(medicineCartOMSInput);
    }
    if (orderLineItems.length > 0) {
      let finalAmount = 0;
      if (medicineCartOMSInput.coupon) {
        const pharmaCouponInput: PharmaCouponInputArgs = {
          pharmaCouponInput: {
            code: medicineCartOMSInput.coupon,
            patientId: medicineCartOMSInput.patientId,
            orderLineItems: orderLineItems,
          },
        };
        const context: CouponServiceContext = {
          mobileNumber,
          doctorsDb,
          consultsDb,
          patientsDb: profilesDb,
        };
        const couponValidity: PharmaOutput = (await validatePharmaCoupon(
          null,
          pharmaCouponInput,
          context
        )) as PharmaOutput;
        if (!couponValidity.validityStatus) {
          throw new AphError(AphErrorMessages.INVALID_COUPON_CODE, undefined, {});
        }
        if (couponValidity.discountedTotals) {
          const discountedTotals = couponValidity.discountedTotals;
          finalAmount =
            discountedTotals.mrpPriceTotal -
            discountedTotals.couponDiscount -
            discountedTotals.productDiscount;
        }
      } else {
        finalAmount = orderLineItems.reduce((addedAmount, lineItem) => {
          return addedAmount + lineItem.quantity * lineItem.specialPrice;
        }, 0);
      }
      if (medicineCartOMSInput.devliveryCharges) {
        finalAmount += medicineCartOMSInput.devliveryCharges;
      }
      if (
        Math.abs(Math.floor(finalAmount) - Math.floor(medicineCartOMSInput.estimatedAmount)) > 1
      ) {
        throw new AphError(
          AphErrorMessages.SAVE_MEDICINE_ORDER_INVALID_AMOUNT_ERROR,
          undefined,
          {}
        );
      }
    }
  }

  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    estimatedAmount: medicineCartOMSInput.estimatedAmount,
    orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
    shopId: medicineCartOMSInput.shopId,
    quoteDateTime: new Date(),
    devliveryCharges: medicineCartOMSInput.devliveryCharges,
    deliveryType: medicineCartOMSInput.medicineDeliveryType,
    quoteId: medicineCartOMSInput.quoteId,
    prescriptionImageUrl: medicineCartOMSInput.prescriptionImageUrl,
    prismPrescriptionFileId: medicineCartOMSInput.prismPrescriptionFileId,
    currentStatus: MEDICINE_ORDER_STATUS.QUOTE,
    orderTat: medicineCartOMSInput.orderTat,
    bookingSource: medicineCartOMSInput.bookingSource,
    deviceType: medicineCartOMSInput.deviceType,
    patientAddressId: medicineCartOMSInput.patientAddressId,
    coupon: medicineCartOMSInput.coupon,
    couponDiscount: medicineCartOMSInput.couponDiscount,
    productDiscount: medicineCartOMSInput.productDiscount,
    packagingCharges: medicineCartOMSInput.packagingCharges,
    showPrescriptionAtStore: medicineCartOMSInput.showPrescriptionAtStore,
    shopAddress: JSON.stringify(medicineCartOMSInput.shopAddress),
    customerComment: medicineCartOMSInput.customerComment,
    isOmsOrder: true,
  };

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);

  try {
    const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);
    if (saveOrder) {
      const medicineOrderLineItems = medicineCartOMSInput.items.map(async (item) => {
        const orderItemAttrs: Partial<MedicineOrderLineItems> = {
          medicineOrders: saveOrder,
          ...item,
        };
        await medicineOrdersRepo.saveMedicineOrderLineItem(orderItemAttrs);
      });
      await Promise.all(medicineOrderLineItems);

      const medicineOrderStatusAttrs: Partial<MedicineOrdersStatus> = {
        medicineOrders: saveOrder,
        orderStatus: MEDICINE_ORDER_STATUS.QUOTE,
        statusDate: new Date(),
        hideStatus: false,
      };
      await medicineOrdersRepo.saveMedicineOrderStatus(
        medicineOrderStatusAttrs,
        saveOrder.orderAutoId
      );

      medicineOrderAddressDetails.medicineOrders = saveOrder;
      await medicineOrdersRepo.saveMedicineOrderAddress(medicineOrderAddressDetails);
    }
    return {
      errorCode,
      errorMessage,
      orderId: saveOrder.id,
      orderAutoId: saveOrder.orderAutoId,
    };
  } catch (e) {
    throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_ERROR, undefined, e);
  }
};

const validateStoreItems = async (medicineCartOMSInput: MedicineCartOMSInput) => {
  const orderLineItems: OrderLineItems[] = [];
  const apiPromises: Promise<any>[] = [];
  apiPromises.push(getStoreItems(medicineCartOMSInput.items, medicineCartOMSInput.shopId));
  apiPromises.push(getMagentoItems(medicineCartOMSInput.items));

  const [storeItemDetails, magentoItemDetails] = await Promise.all(apiPromises);
  if (storeItemDetails.length == 0) {
    return orderLineItems;
  }
  medicineCartOMSInput.items.map((item) => {
    const storeItem = storeItemDetails.find((productItem: StoreItemDetail) => {
      return productItem.itemId == item.medicineSKU;
    });
    const magentoItem = magentoItemDetails.find((productItem: PharmaLineItemResult) => {
      return productItem.sku == item.medicineSKU;
    });
    if (storeItem && magentoItem) {
      let price = Number((storeItem.mrp * item.mou).toFixed(2));
      let specialPrice = magentoItem.special_price || magentoItem.price;
      const type = magentoItem.type_id && magentoItem.type_id.toLowerCase();
      if (isDiffLessThan25Percent(magentoItem.price, price)) {
        specialPrice = getSpecialPriceFromRelativePrices(magentoItem.price, specialPrice, price);
      } else {
        price = magentoItem.price;
      }
      orderLineItems.push({
        itemId: item.medicineSKU,
        productName: item.medicineName,
        productType:
          type == 'pharma'
            ? CouponCategoryApplicable.PHARMA
            : type == 'pl'
            ? CouponCategoryApplicable.PL
            : CouponCategoryApplicable.FMCG,
        mrp: price,
        specialPrice: specialPrice,
        quantity: item.quantity,
      });
    }
  });
  return orderLineItems;
};

const validatePharmaItems = async (medicineCartOMSInput: MedicineCartOMSInput) => {
  const orderLineItems: OrderLineItems[] = [];
  const lineItemsDetails = await getMagentoItems(medicineCartOMSInput.items);

  medicineCartOMSInput.items.map((item) => {
    const orderLineItem = lineItemsDetails.find((productItem) => {
      return productItem.sku == item.medicineSKU;
    });
    if (orderLineItem) {
      const type = orderLineItem.type_id && orderLineItem.type_id.toLowerCase();
      orderLineItems.push({
        itemId: orderLineItem.sku,
        productName: orderLineItem.name,
        productType:
          type == 'pharma'
            ? CouponCategoryApplicable.PHARMA
            : type == 'pl'
            ? CouponCategoryApplicable.PL
            : CouponCategoryApplicable.FMCG,
        mrp: orderLineItem.price,
        specialPrice: orderLineItem.special_price || orderLineItem.price,
        quantity: item.quantity,
      });
    }
  });

  return orderLineItems;
};

const getMagentoItems = async (items: MedicineCartOMSItem[]) => {
  const itemsSkus = items.map((item) => {
    return item.medicineSKU;
  });

  const skusInfoUrl = process.env.PHARMACY_MED_BULK_PRODUCT_INFO_URL || '';
  const authToken = process.env.PHARMACY_MED_AUTH_TOKEN || '';
  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_TO_PHARMACY: ${skusInfoUrl}`,
    'FETCH_ITEM_DETAILS_FROM_PHARMACY()->API_CALL_STARTING',
    itemsSkus.join(','),
    ''
  );
  const pharmaResp = await fetch(skusInfoUrl, {
    method: 'POST',
    body: JSON.stringify({
      params: itemsSkus.join(','),
    }),
    headers: { 'Content-Type': 'application/json', authorization: authToken },
  });

  if (pharmaResp.status != 200) {
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_TO_PHARMACY: ${skusInfoUrl}`,
      'FETCH_ITEM_DETAILS_FROM_PHARMACY()->API_CALL_FAILED',
      JSON.stringify(pharmaResp),
      ''
    );
    throw new AphError(AphErrorMessages.FETCH_ITEM_DETAILS_FROM_PHARMACY_ERROR, undefined, {});
  }

  const lineItemsDetails: PharmaItemsResponse = await pharmaResp.json();

  return lineItemsDetails.productdp || [];
};

const getStoreItems = async (items: MedicineCartOMSItem[], shopId: string) => {
  const storeInventoryCheck = process.env.PHARMACY_MED_STORE_INVENTORY_URL || '';
  const authToken = process.env.PHARMACY_MED_DELIVERY_AUTH_TOKEN || '';
  const itemdetails = items.map((item) => {
    return {
      ItemId: item.medicineSKU,
    };
  });
  const reqBody = JSON.stringify({
    shopId: shopId,
    itemdetails,
  });
  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_TO_PHARMACY: ${storeInventoryCheck}`,
    'FETCH_STORE_INVENTORY_FROM_PHARMACY__API_CALL_STARTING',
    reqBody,
    ''
  );

  const pharmaResp = await fetch(storeInventoryCheck, {
    method: 'POST',
    body: reqBody,
    headers: { 'Content-Type': 'application/json', Authentication: authToken },
  });
  if (pharmaResp.status != 200) {
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_TO_PHARMACY: ${storeInventoryCheck}`,
      'FETCH_STORE_INVENTORY_FROM_PHARMACY__API_CALL_FAILED',
      JSON.stringify(pharmaResp),
      ''
    );
    return [];
  }

  const storeItemsDetails: StoreInventoryResp = await pharmaResp.json();
  if (!storeItemsDetails.requestStatus) {
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_TO_PHARMACY: ${storeInventoryCheck}`,
      'FETCH_STORE_INVENTORY_FROM_PHARMACY__API_CALL_FAILED',
      JSON.stringify(pharmaResp),
      ''
    );
    return [];
  }

  return storeItemsDetails.itemDetails;
};

const isDiffLessThan25Percent = (num1: number, num2: number) => {
  const diffP = ((num1 - num2) / num1) * 100;
  return Math.abs(diffP) < 25;
};
const getSpecialPriceFromRelativePrices = (price: number, specialPrice: number, newPrice: number) =>
  Number(((specialPrice / price) * newPrice).toFixed(2));

export const saveMedicineOrderOMSResolvers = {
  Mutation: {
    saveMedicineOrderOMS,
  },
};
