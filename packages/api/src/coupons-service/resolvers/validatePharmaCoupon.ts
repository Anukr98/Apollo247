import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { APPOINTMENT_TYPE } from 'consults-service/entities';
import { ApiConstants } from 'ApiConstants';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { discountCalculation, genericRuleCheck } from 'helpers/couponCommonFunctions';
import { Coupon, CouponCategoryApplicable } from 'profiles-service/entities';
import { customerTypeInCoupons } from 'coupons-service/resolvers/validateConsultCoupon';

export const validatePharmaCouponTypeDefs = gql`
  enum AppointmentType {
    ONLINE
    PHYSICAL
    BOTH
  }

  enum CustomerType {
    FIRST
    RECURRING
  }

  enum DiscountType {
    FLATPRICE
    PERCENT
    PRICEOFF
  }

  type ValidateCodeResponse {
    validityStatus: Boolean!
    revisedAmount: String!
    reasonForInvalidStatus: String!
  }

  type CouponConsultRule {
    couponApplicability: AppointmentType
    createdDate: DateTime
    id: ID
    isActive: Boolean
  }

  type ConsultCoupon {
    code: String
    couponConsultRule: CouponConsultRule
    couponGenericRule: CouponGenericRule
    createdDate: DateTime
    description: String
    id: ID
    isActive: Boolean
  }

  type CouponGenericRule {
    couponApplicableCustomerType: CustomerType
    couponDueDate: DateTime
    couponEndDate: DateTime
    couponReuseCount: Int
    couponReuseCountPerCustomer: Int
    couponStartDate: DateTime
    createdDate: DateTime
    discountType: DiscountType
    discountValue: Float
    id: ID
    isActive: Boolean
    maximumCartValue: Float
    minimumCartValue: Float
    numberOfCouponsNeeded: Int
  }

  type CouponList {
    coupons: [ConsultCoupon]
  }

  extend type Query {
    validatePharmaCoupon(
      doctorId: ID!
      code: String!
      consultType: AppointmentType!
      appointmentDateTimeInUTC: DateTime!
    ): ValidateCodeResponse
    getPharmaCouponList: CouponList
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
};

const validatePharmaCoupon: Resolver<
  null,
  PharmaCouponInputArgs,
  CouponServiceContext,
  PharmaOutput
> = async (
  parent,
  { pharmaCouponInput, code },
  { mobileNumber, patientsDb, doctorsDb, consultsDb }
) => {
  //check for patient request validity
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.findByMobileNumber(mobileNumber);
  if (patientData.length == 0) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //get patientIds
  const patientIds = patientData.map((item) => item.id);

  //get coupon by code
  const couponRepo = patientsDb.getCustomRepository(CouponRepository);
  const couponData = await couponRepo.findPharmaCouponByCode(code);
  if (couponData == null)
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
    };

  //get coupon related generic rule
  const couponGenericRulesData = couponData.couponGenericRule;
  if (couponGenericRulesData == null)
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
    };

  //get coupon related consult rule
  const couponRulesData = couponData.couponPharmaRule;
  if (couponRulesData == null)
    return {
      discountedTotals: undefined,
      pharmaLineItemsWithDiscountedPrice: undefined,
      successMessage: '',
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
    };

  return {
    discountedTotals: undefined,
    pharmaLineItemsWithDiscountedPrice: undefined,
    successMessage: '',
    reasonForInvalidStatus: '',
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
