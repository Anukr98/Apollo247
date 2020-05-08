import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { ApiConstants } from 'ApiConstants';
import { discountCalculation } from 'helpers/couponCommonFunctions';
import {
  Coupon,
  CouponCategoryApplicable,
  PharmaDiscountApplicableOn,
} from 'profiles-service/entities';
import { customerTypeInCoupons } from 'coupons-service/resolvers/validateConsultCoupon';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';

export const validatePharmaCouponTypeDefs = gql`
  enum CouponCategoryApplicable {
    PHARMA
    FMCG
    PHARMA_FMCG
  }

  type PharmaCouponInput {
    mrp: Float!
    productName: String!
    productType: CouponCategoryApplicable!
    quantity: Int!
    specialPrice: Float!
  }

  input PharmaCouponInputArgs {
    code: String!
    patientId: String!
    pharmaCouponInput: [PharmaCouponInput]!
  }

  type PharmaLineItems {
    discountedPrice: Float!
    mrp: Float!
    productName: String!
    productType: CouponCategoryApplicable!
    quantity: Int!
    specialPrice: Float!
  }

  type DiscountedTotals {
    applicableDiscount: Float!
    couponDiscount: Float!
    productDiscount: Float!
  }

  type PharmaOutput {
    discountedTotals: Float
    pharmaLineItemsWithDiscountedPrice: [PharmaLineItems]
    successMessage: String
    reasonForInvalidStatus: String!
    validityStatus: Boolean!
  }

  extend type Query {
    validatePharmaCoupon(pharmaCouponInputArgs: PharmaCouponInputArgs): PharmaOutput
  }
`;

type PharmaCouponInput = {
  mrp: number;
  productName: string;
  productType: CouponCategoryApplicable;
  quantity: string;
  specialPrice: number;
};

type PharmaCouponInputArgs = {
  code: string;
  patientId: string;
  pharmaCouponInput: PharmaCouponInput[];
};

type PharmaLineItems = {
  discountedPrice: number;
  mrp: number;
  productName: string;
  productType: CouponCategoryApplicable;
  quantity: string;
  specialPrice: number;
};

type DiscountedTotals = {
  applicableDiscount: number;
  couponDiscount: number;
  productDiscount: number;
};

type PharmaOutput = {
  discountedTotals: DiscountedTotals | undefined;
  pharmaLineItemsWithDiscountedPrice: PharmaLineItems[] | undefined;
  successMessage: string | undefined;
  reasonForInvalidStatus: string;
  validityStatus: boolean;
};

const validatePharmaCoupon: Resolver<
  null,
  PharmaCouponInputArgs,
  CouponServiceContext,
  PharmaOutput
> = async (
  parent,
  { code, patientId, pharmaCouponInput },
  { mobileNumber, patientsDb, doctorsDb, consultsDb }
) => {
  //check for patient request validity
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

  //coupon start date check
  const todayDate = new Date();
  if (
    couponGenericRulesData.couponStartDate &&
    todayDate < couponGenericRulesData.couponStartDate
  ) {
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      validityStatus: false,
      reasonForInvalidStatus: ApiConstants.EARLY_COUPON.toString(),
    };
  }

  // coupon end date check
  if (couponGenericRulesData.couponEndDate && todayDate > couponGenericRulesData.couponEndDate) {
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      validityStatus: false,
      reasonForInvalidStatus: ApiConstants.COUPON_EXPIRED.toString(),
    };
  }

  const lineItemsWithDiscount = pharmaCouponInput.map((item) => {
    return {
      ...item,
      discountedPrice: 0,
    };
  });

  lineItemsWithDiscount.forEach((lineItem, index) => {
    //coupon couponCategoryApplicable check
    if (couponRulesData.couponCategoryApplicable) {
      if (
        couponRulesData.couponCategoryApplicable == CouponCategoryApplicable.PHARMA_FMCG ||
        couponRulesData.couponCategoryApplicable == lineItem.productType
      ) {
        const itemPrice =
          couponRulesData.discountApplicableOn == PharmaDiscountApplicableOn.MRP
            ? lineItem.mrp
            : lineItem.specialPrice;

        if (
          couponGenericRulesData.minimumCartValue &&
          itemPrice < couponGenericRulesData.minimumCartValue
        )
          return;

        if (
          couponGenericRulesData.maximumCartValue &&
          itemPrice > couponGenericRulesData.maximumCartValue
        )
          return;

        lineItem.discountedPrice = discountCalculation(
          itemPrice,
          couponGenericRulesData.discountType,
          couponGenericRulesData.discountValue
        );
      }
    }
  });

  console.log('lineItemsWithDiscount::', lineItemsWithDiscount);

  return {
    discountedTotals: undefined,
    pharmaLineItemsWithDiscountedPrice: undefined,
    successMessage: '',
    reasonForInvalidStatus: '',
    validityStatus: true,
  };
};

const getPharmaCouponList: Resolver<
  null,
  {},
  CouponServiceContext,
  {
    coupons: Coupon[];
  }
> = async (parent, args, { mobileNumber, patientsDb, doctorsDb, consultsDb }) => {
  //check for patient request validity
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.findDetailsByMobileNumber(mobileNumber);
  if (patientData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const couponRepo = patientsDb.getCustomRepository(CouponRepository);
  const couponData = await couponRepo.getActiveCoupons();
  return { coupons: couponData };
};

export const validatePharmaCouponResolvers = {
  Query: {
    validatePharmaCoupon,
    getPharmaCouponList,
  },
};
