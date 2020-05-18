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
  MedicineOrdersStatus,
  CouponCategoryApplicable,
  PharmaDiscountApplicableOn,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { Connection } from 'typeorm';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { discountCalculation } from 'helpers/couponCommonFunctions';

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
};

type MedicineCartOMSItem = {
  medicineSku: string;
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
> = async (parent, { medicineCartOMSInput }, { profilesDb }) => {
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
  if (
    medicineCartOMSInput.patientAddressId != '' &&
    medicineCartOMSInput.patientAddressId != null
  ) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(
      medicineCartOMSInput.patientAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
  }
  if (medicineCartOMSInput.coupon) {
    const couponValidity = await validateCoupon(profilesDb, medicineCartOMSInput);
    if (!couponValidity.validityStatus) {
      throw new AphError(AphErrorMessages.INVALID_COUPON_CODE, undefined, {});
    }
    if (
      !couponValidity.estimatedAmount ||
      medicineCartOMSInput.estimatedAmount !=
        couponValidity.estimatedAmount + (medicineCartOMSInput.devliveryCharges || 0)
    ) {
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

const validateCoupon = async (profilesDb: Connection, orderDetails: MedicineCartOMSInput) => {
  const couponRepo = profilesDb.getCustomRepository(CouponRepository);
  const couponData = await couponRepo.findPharmaCouponByCode(orderDetails.coupon);

  if (couponData == null)
    return {
      validityStatus: false,
    };

  //get coupon related generic rule
  const couponGenericRulesData = couponData.couponGenericRule;
  if (couponGenericRulesData == null)
    return {
      validityStatus: false,
    };

  //get coupon related pharma rule
  const couponRulesData = couponData.couponPharmaRule;
  if (couponRulesData == null)
    return {
      validityStatus: false,
    };

  //customer type check
  const medicineOrderRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  if (
    couponGenericRulesData.couponApplicableCustomerType &&
    couponGenericRulesData.couponApplicableCustomerType == customerTypeInCoupons.FIRST
  ) {
    const orderCount = await medicineOrderRepo.getMedicineOrdersCountByPatient(
      orderDetails.patientId
    );
    if (orderCount != 0)
      return {
        validityStatus: false,
      };
  }

  // coupon count per customer check
  if (couponGenericRulesData.couponReuseCountPerCustomer) {
    const customerUsageCount = await medicineOrderRepo.getMedicineOrdersCountByCouponAndPatient(
      orderDetails.patientId,
      orderDetails.coupon
    );
    if (customerUsageCount >= couponGenericRulesData.couponReuseCountPerCustomer)
      return {
        validityStatus: false,
      };
  }

  //total coupon count irrespective to customer
  if (couponGenericRulesData.couponReuseCount) {
    const customerUsageCount = await medicineOrderRepo.getMedicineOrdersCountByCoupon(
      orderDetails.coupon
    );
    if (customerUsageCount >= couponGenericRulesData.couponReuseCount)
      return {
        validityStatus: false,
      };
  }

  //coupon start date check
  const todayDate = new Date();
  if (couponGenericRulesData.couponStartDate && todayDate < couponGenericRulesData.couponStartDate)
    return {
      validityStatus: false,
    };

  // coupon end date check
  if (couponGenericRulesData.couponEndDate && todayDate > couponGenericRulesData.couponEndDate)
    return {
      validityStatus: false,
    };

  const lineItemsWithDiscount = orderDetails.items.map((item) => {
    return {
      ...item,
      discountedPrice: 0,
      applicablePrice: 0,
    };
  });

  let specialPriceTotal = 0;
  let mrpPriceTotal = 0;
  let discountedPriceTotal = 0;

  lineItemsWithDiscount.forEach((lineItem, index) => {
    //coupon couponCategoryApplicable check
    const productType = lineItem.isMedicine == '1' ? 'PHARMA' : 'FMCG';
    if (couponRulesData.couponCategoryApplicable) {
      if (
        couponRulesData.couponCategoryApplicable == CouponCategoryApplicable.PHARMA_FMCG ||
        couponRulesData.couponCategoryApplicable == productType
      ) {
        const itemPrice =
          couponRulesData.discountApplicableOn == PharmaDiscountApplicableOn.MRP
            ? lineItem.mrp
            : lineItem.specialPrice;

        if (
          couponGenericRulesData.minimumCartValue &&
          itemPrice < couponGenericRulesData.minimumCartValue
        ) {
          return;
        }

        if (
          couponGenericRulesData.maximumCartValue &&
          itemPrice > couponGenericRulesData.maximumCartValue
        )
          return;

        const discountedPrice = discountCalculation(
          itemPrice,
          couponGenericRulesData.discountType,
          couponGenericRulesData.discountValue
        );
        lineItem.discountedPrice = Number(discountedPrice.toFixed(2));
        lineItem.applicablePrice =
          lineItem.discountedPrice < lineItem.specialPrice
            ? lineItem.discountedPrice
            : lineItem.specialPrice;
      } else {
        lineItem.applicablePrice =
          lineItem.mrp < lineItem.specialPrice ? lineItem.mrp : lineItem.specialPrice;
      }
    }

    specialPriceTotal = specialPriceTotal + lineItem.specialPrice * lineItem.quantity;
    mrpPriceTotal = mrpPriceTotal + lineItem.mrp * lineItem.quantity;
    discountedPriceTotal =
      discountedPriceTotal + (lineItem.mrp - lineItem.applicablePrice) * lineItem.quantity;
  });

  const productDiscount = Number((mrpPriceTotal - specialPriceTotal).toFixed(2));
  const couponDiscount = Number(discountedPriceTotal.toFixed(2)) - productDiscount;

  return {
    estimatedAmount: mrpPriceTotal - couponDiscount - productDiscount,
    validityStatus: true,
  };
};

export const saveMedicineOrderOMSResolvers = {
  Mutation: {
    saveMedicineOrderOMS,
  },
};
