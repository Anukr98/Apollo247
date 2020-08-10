import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { ApiConstants } from 'ApiConstants';
import { discountCalculation, genericRuleCheck } from 'helpers/couponCommonFunctions';
import { CouponCategoryApplicable, PharmaDiscountApplicableOn } from 'profiles-service/entities';
import { customerTypeInCoupons } from 'coupons-service/resolvers/validateConsultCoupon';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { getCouponsList } from 'helpers/couponServices';

export const validatePharmaCouponTypeDefs = gql`
  enum CouponCategoryApplicable {
    PHARMA
    FMCG
    PHARMA_FMCG
  }

  type PharmaLineItems {
    applicablePrice: Float!
    discountedPrice: Float!
    itemId: String!
    mrp: Float!
    productName: String!
    productType: CouponCategoryApplicable!
    quantity: Int!
    specialPrice: Float!
  }

  type DiscountedTotals {
    couponDiscount: Float!
    mrpPriceTotal: Float!
    productDiscount: Float!
  }

  type PharmaOutput {
    discountedTotals: DiscountedTotals
    pharmaLineItemsWithDiscountedPrice: [PharmaLineItems]
    successMessage: String
    reasonForInvalidStatus: String!
    validityStatus: Boolean!
  }

  input OrderLineItems {
    itemId: String!
    mrp: Float!
    productName: String!
    productType: CouponCategoryApplicable!
    quantity: Int!
    specialPrice: Float!
  }

  input PharmaCouponInput {
    code: String!
    patientId: ID!
    orderLineItems: [OrderLineItems]
  }

  extend type Query {
    validatePharmaCoupon(pharmaCouponInput: PharmaCouponInput): PharmaOutput
    getPharmaCouponList: CouponList
  }
`;

export type OrderLineItems = {
  itemId: string;
  mrp: number;
  productName: string;
  productType: CouponCategoryApplicable;
  quantity: number;
  specialPrice: number;
};

type PharmaCouponInput = {
  code: string;
  patientId: string;
  orderLineItems: OrderLineItems[];
};

export type PharmaCouponInputArgs = { pharmaCouponInput: PharmaCouponInput };

type PharmaLineItems = {
  applicablePrice: number;
  discountedPrice: number;
  itemId: string;
  mrp: number;
  productName: string;
  productType: CouponCategoryApplicable;
  quantity: number;
  specialPrice: number;
};

type DiscountedTotals = {
  couponDiscount: number;
  mrpPriceTotal: number;
  productDiscount: number;
};

export type PharmaOutput = {
  discountedTotals: DiscountedTotals | undefined;
  pharmaLineItemsWithDiscountedPrice: PharmaLineItems[] | undefined;
  successMessage: string | undefined;
  reasonForInvalidStatus: string;
  validityStatus: boolean;
};

export const validatePharmaCoupon: Resolver<
  null,
  PharmaCouponInputArgs,
  CouponServiceContext,
  PharmaOutput
> = async (parent, { pharmaCouponInput }, { mobileNumber, patientsDb, doctorsDb, consultsDb }) => {
  //check for patient request validity

  const { patientId, code, orderLineItems } = pharmaCouponInput;

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.getPatientDetails(patientId);
  if (patientData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //get coupon by code
  const couponRepo = patientsDb.getCustomRepository(CouponRepository);
  const couponData = await couponRepo.findPharmaCouponByCode(code);

  if (couponData == null)
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
      validityStatus: false,
    };

  //get coupon related generic rule
  const couponGenericRulesData = couponData.couponGenericRule;
  if (couponGenericRulesData == null)
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
      validityStatus: false,
    };

  //get coupon related pharma rule
  const couponRulesData = couponData.couponPharmaRule;
  if (couponRulesData == null)
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
      validityStatus: false,
    };

  //customer type check
  const medicineOrderRepo = patientsDb.getCustomRepository(MedicineOrdersRepository);
  if (
    couponGenericRulesData.couponApplicableCustomerType &&
    couponGenericRulesData.couponApplicableCustomerType == customerTypeInCoupons.FIRST
  ) {
    const orderCount = await medicineOrderRepo.getMedicineOrdersCountByPatient(patientId);
    if (
      couponGenericRulesData.couponApplicableCustomerType == customerTypeInCoupons.FIRST &&
      orderCount != 0
    ) {
      return {
        discountedTotals: undefined,
        pharmaLineItemsWithDiscountedPrice: undefined,
        successMessage: '',
        reasonForInvalidStatus: ApiConstants.COUPON_FOR_FIRST_CUSTOMER_ONLY.toString(),
        validityStatus: false,
      };
    }
  }

  // coupon count per customer check
  if (couponGenericRulesData.couponReuseCountPerCustomer) {
    const customerUsageCount = await medicineOrderRepo.getMedicineOrdersCountByCouponAndPatient(
      patientId,
      code
    );
    if (customerUsageCount >= couponGenericRulesData.couponReuseCountPerCustomer)
      return {
        discountedTotals: undefined,
        pharmaLineItemsWithDiscountedPrice: undefined,
        successMessage: '',
        reasonForInvalidStatus: ApiConstants.COUPON_COUNT_PER_CUSTOMER_EXCEEDED.toString(),
        validityStatus: false,
      };
  }

  //total coupon count irrespective to customer
  if (couponGenericRulesData.couponReuseCount) {
    const customerUsageCount = await medicineOrderRepo.getMedicineOrdersCountByCoupon(code);
    if (customerUsageCount >= couponGenericRulesData.couponReuseCount)
      return {
        discountedTotals: undefined,
        pharmaLineItemsWithDiscountedPrice: undefined,
        successMessage: '',
        reasonForInvalidStatus: ApiConstants.COUPON_COUNT_USAGE_EXPIRED.toString(),
        validityStatus: false,
      };
  }

  let cartPrice = 0;
  const lineItemsWithDiscount = orderLineItems.map((item) => {
    const itemPrice = item.mrp < item.specialPrice ? item.mrp : item.specialPrice;
    cartPrice = cartPrice + itemPrice * item.quantity;
    return {
      ...item,
      discountedPrice: 0,
      applicablePrice: 0,
    };
  });

  //call to check generic rule
  const genericRuleCheckResult = await genericRuleCheck(couponGenericRulesData, cartPrice);
  if (genericRuleCheckResult) {
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      validityStatus: genericRuleCheckResult.validityStatus,
      reasonForInvalidStatus: genericRuleCheckResult.reasonForInvalidStatus,
    };
  }

  let specialPriceTotal = 0;
  let mrpPriceTotal = 0;
  let discountedPriceTotal = 0;

  lineItemsWithDiscount.forEach((lineItem, index) => {
    //coupon couponCategoryApplicable check

    if (couponRulesData.couponCategoryApplicable) {
      if (
        couponRulesData.couponCategoryApplicable == CouponCategoryApplicable.PHARMA_FMCG ||
        couponRulesData.couponCategoryApplicable == lineItem.productType
      ) {
        const itemPrice =
          couponRulesData.discountApplicableOn == PharmaDiscountApplicableOn.MRP
            ? lineItem.mrp * lineItem.quantity
            : lineItem.specialPrice * lineItem.quantity;

        lineItem.applicablePrice =
          lineItem.mrp < lineItem.specialPrice ? lineItem.mrp : lineItem.specialPrice;

        const discountedPrice = discountCalculation(
          itemPrice,
          couponGenericRulesData.discountType,
          couponGenericRulesData.discountValue
        );
        lineItem.discountedPrice = Number(discountedPrice.toFixed(2));
        lineItem.applicablePrice =
          lineItem.discountedPrice < lineItem.specialPrice * lineItem.quantity
            ? lineItem.discountedPrice
            : lineItem.specialPrice * lineItem.quantity;
      } else {
        lineItem.applicablePrice =
          lineItem.mrp < lineItem.specialPrice ? lineItem.mrp : lineItem.specialPrice;
        lineItem.applicablePrice = lineItem.applicablePrice * lineItem.quantity;
      }
    }
    lineItem.applicablePrice = Number((lineItem.applicablePrice / lineItem.quantity).toFixed(2));
    specialPriceTotal = specialPriceTotal + lineItem.specialPrice * lineItem.quantity;
    mrpPriceTotal = mrpPriceTotal + lineItem.mrp * lineItem.quantity;
    discountedPriceTotal =
      discountedPriceTotal + (lineItem.mrp - lineItem.applicablePrice) * lineItem.quantity;
  });

  const productDiscount = Number((mrpPriceTotal - specialPriceTotal).toFixed(2));

  const discountedTotals = {
    couponDiscount: Number((Number(discountedPriceTotal.toFixed(2)) - productDiscount).toFixed(2)),
    mrpPriceTotal: mrpPriceTotal,
    productDiscount: productDiscount,
  };

  return {
    discountedTotals: discountedTotals,
    pharmaLineItemsWithDiscountedPrice: lineItemsWithDiscount,
    successMessage: couponRulesData.successMessage,
    reasonForInvalidStatus: '',
    validityStatus: true,
  };
};

type CouponData = {
  code: string;
  couponPharmaRule: {
    messageOnCouponScreen: string;
  };
};

type CouponDetails = CouponData[];

const getPharmaCouponList: Resolver<
  null,
  {},
  CouponServiceContext,
  {
    coupons: CouponDetails;
  }
> = async (parent, args, { mobileNumber, patientsDb }) => {
  //check for patient request validity
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.findDetailsByMobileNumber(mobileNumber);
  if (patientData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const couponDetails: CouponDetails = [];
  const couponData = await getCouponsList();
  couponData.response.map((item) => {
    const singleCoupon: CouponData = {
      code: item.coupon,
      couponPharmaRule: {
        messageOnCouponScreen: item.message,
      },
    };
    couponDetails.push(singleCoupon);
  });

  return { coupons: couponDetails };
};

export const validatePharmaCouponResolvers = {
  Query: {
    validatePharmaCoupon,
    getPharmaCouponList,
  },
};
