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
import { PharmaItemsResponse } from 'types/medicineOrderTypes';
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
    patientAddressId: ID!
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
  }

  input ShopAddress {
    storename: String
    address: String
    workinghrs: String
    phone: String
    city: String
    state: String
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
};

type ShopAddress = {
  storename: string;
  address: string;
  workinghrs: string;
  phone: string;
  city: string;
  state: string;
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
  const patientDetails = await patientRepo.findById(medicineCartOMSInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (!medicineCartOMSInput.patientAddressId && !medicineCartOMSInput.shopId) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
  }
  if (medicineCartOMSInput.patientAddressId) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(
      medicineCartOMSInput.patientAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
  }

  const itemsSkus = medicineCartOMSInput.items.map((item) => {
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
    throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_ERROR, undefined, {});
  }

  const lineItemsDetails: PharmaItemsResponse = await pharmaResp.json();

  const orderLineItems: OrderLineItems[] = [];
  medicineCartOMSInput.items.map((item) => {
    const orderLineItem = lineItemsDetails.productdp.find((productItem) => {
      return productItem.sku == item.medicineSKU;
    });
    if (orderLineItem) {
      orderLineItems.push({
        itemId: orderLineItem.sku,
        productName: orderLineItem.name,
        productType:
          orderLineItem.type_id == 'PHARMA'
            ? CouponCategoryApplicable.PHARMA
            : CouponCategoryApplicable.FMCG,
        mrp: orderLineItem.price,
        specialPrice: orderLineItem.special_price || orderLineItem.price,
        quantity: item.quantity,
      });
    }
  });

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
      const finalAmount =
        (medicineCartOMSInput.devliveryCharges || 0) +
        discountedTotals.mrpPriceTotal -
        discountedTotals.couponDiscount -
        discountedTotals.productDiscount;
      if (medicineCartOMSInput.estimatedAmount != Number(finalAmount.toFixed(2))) {
        throw new AphError(AphErrorMessages.INVALID_COUPON_CODE, undefined, {});
      }
    }
  } else {
    let estimatedAmount = orderLineItems.reduce((addedAmount, lineItem) => {
      return addedAmount + lineItem.quantity * lineItem.specialPrice;
    }, 0);
    if (medicineCartOMSInput.devliveryCharges) {
      estimatedAmount += medicineCartOMSInput.devliveryCharges;
    }

    if (estimatedAmount != medicineCartOMSInput.estimatedAmount) {
      throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_ERROR, undefined, {});
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

export const saveMedicineOrderOMSResolvers = {
  Mutation: {
    saveMedicineOrderOMS,
  },
};
