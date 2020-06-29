import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { APPOINTMENT_TYPE } from 'consults-service/entities';

import { Coupon } from 'profiles-service/entities';

export const validateConsultCouponTypeDefs = gql`
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
    couponPharmaRule: CouponPharmaRule
    createdDate: DateTime
    description: String
    displayStatus: Boolean
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

  enum PharmaDiscountApplicableOn {
    MRP
    SPECIAL_PRICE
  }

  type CouponPharmaRule {
    couponCategoryApplicable: CouponCategoryApplicable
    discountApplicableOn: PharmaDiscountApplicableOn
    messageOnCouponScreen: String
    successMessage: String
  }

  type CouponList {
    coupons: [ConsultCoupon]
  }

  extend type Query {
    validateConsultCoupon(
      doctorId: ID!
      code: String!
      consultType: AppointmentType!
      appointmentDateTimeInUTC: DateTime!
    ): ValidateCodeResponse
    getConsultCouponList: CouponList
  }
`;

export enum customerTypeInCoupons {
  FIRST = 'FIRST',
  RECURRING = 'RECURRING',
}

const validateConsultCoupon: Resolver<
  null,
  { code: string; doctorId: string; consultType: APPOINTMENT_TYPE; appointmentDateTimeInUTC: Date },
  CouponServiceContext,
  {
    validityStatus: boolean;
    revisedAmount: number;
    reasonForInvalidStatus: string;
  }
> = async (parent, args, { mobileNumber, patientsDb, doctorsDb, consultsDb }) => {
  //check for patient request validity
  // const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  // const patientData = await patientRepo.findByMobileNumber(mobileNumber);
  // if (patientData.length == 0) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  // //get patientIds
  // const patientIds = patientData.map((item) => item.id);

  // //get doctors Data
  // const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  // const doctorData = await doctorRepo.findById(args.doctorId);
  // if (doctorData == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

  // //get Doctor fees
  // let doctorFees = 0;
  // if (args.consultType === APPOINTMENT_TYPE.ONLINE)
  //   doctorFees = <number>doctorData.onlineConsultationFees;
  // else doctorFees = <number>doctorData.physicalConsultationFees;

  // //get coupon by code
  // const couponRepo = patientsDb.getCustomRepository(CouponRepository);
  // const couponData = await couponRepo.findCouponByCode(args.code);
  // if (couponData == null)
  //   return {
  //     validityStatus: false,
  //     revisedAmount: doctorFees,
  //     reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
  //   };

  // //get coupon related generic rule
  // const couponGenericRulesData = couponData.couponGenericRule;
  // if (couponGenericRulesData == null)
  //   return {
  //     validityStatus: false,
  //     revisedAmount: doctorFees,
  //     reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
  //   };

  // //get coupon related consult rule
  // const couponRulesData = couponData.couponConsultRule;
  // if (couponRulesData == null)
  //   return {
  //     validityStatus: false,
  //     revisedAmount: doctorFees,
  //     reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
  //   };

  // //check for coupon applicability as per rules configured
  // //consult mode check
  // if (
  //   couponRulesData.couponApplicability &&
  //   (args.consultType.toString() != couponRulesData.couponApplicability.toString() &&
  //     couponRulesData.couponApplicability.toString() != APPOINTMENT_TYPE.BOTH.toString() &&
  //     args.consultType.toString() != APPOINTMENT_TYPE.BOTH.toString())
  // )
  //   return {
  //     validityStatus: false,
  //     revisedAmount: doctorFees,
  //     reasonForInvalidStatus: ApiConstants.COUPON_WITH_BU_RESTRICTION.replace(
  //       '{0}',
  //       couponRulesData.couponApplicability
  //     ).toString(),
  //   };

  // //call to check generic rule
  // const genericRuleCheckResult = await genericRuleCheck(couponGenericRulesData, doctorFees);
  // if (genericRuleCheckResult) {
  //   return {
  //     validityStatus: genericRuleCheckResult.validityStatus,
  //     revisedAmount: doctorFees,
  //     reasonForInvalidStatus: genericRuleCheckResult.reasonForInvalidStatus,
  //   };
  // }

  // const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);

  // //customer type check
  // if (couponGenericRulesData.couponApplicableCustomerType) {
  //   const appointmentsCount = await appointmentRepo.getPatientAppointmentCountByConsultMode(
  //     patientIds,
  //     args.consultType
  //   );
  //   if (
  //     couponGenericRulesData.couponApplicableCustomerType == customerTypeInCoupons.FIRST &&
  //     appointmentsCount != 0
  //   ) {
  //     return {
  //       validityStatus: false,
  //       revisedAmount: doctorFees,
  //       reasonForInvalidStatus: ApiConstants.COUPON_FOR_FIRST_CUSTOMER_ONLY.toString(),
  //     };
  //   }
  // }

  // // coupon count per customer check
  // if (couponGenericRulesData.couponReuseCountPerCustomer) {
  //   const customerUsageCount = await appointmentRepo.getPatientAppointmentCountByCouponCode(
  //     patientIds,
  //     args.code
  //   );
  //   if (customerUsageCount >= couponGenericRulesData.couponReuseCountPerCustomer)
  //     return {
  //       validityStatus: false,
  //       revisedAmount: doctorFees,
  //       reasonForInvalidStatus: ApiConstants.COUPON_COUNT_PER_CUSTOMER_EXCEEDED.toString(),
  //     };
  // }

  // //total coupon count irrespective to customer
  // if (couponGenericRulesData.couponReuseCount) {
  //   const customerUsageCount = await appointmentRepo.getAppointmentCountByCouponCode(args.code);
  //   if (customerUsageCount >= couponGenericRulesData.couponReuseCount)
  //     return {
  //       validityStatus: false,
  //       revisedAmount: doctorFees,
  //       reasonForInvalidStatus: ApiConstants.COUPON_COUNT_USAGE_EXPIRED.toString(),
  //     };
  // }

  // // Consult last applicable date check
  // if (
  //   couponGenericRulesData.couponDueDate &&
  //   args.appointmentDateTimeInUTC > couponGenericRulesData.couponDueDate
  // ) {
  //   return {
  //     validityStatus: false,
  //     revisedAmount: doctorFees,
  //     reasonForInvalidStatus: ApiConstants.COUPON_EXPIRED.toString(),
  //   };
  // }

  // //discount amount calculation
  // let revisedAmount = doctorFees;
  // if (couponGenericRulesData.discountType && couponGenericRulesData.discountValue >= 0) {
  //   revisedAmount = await discountCalculation(
  //     doctorFees,
  //     couponGenericRulesData.discountType,
  //     couponGenericRulesData.discountValue
  //   );
  // }

  // return { validityStatus: true, revisedAmount: revisedAmount, reasonForInvalidStatus: '' };
  return { validityStatus: false, revisedAmount: 0, reasonForInvalidStatus: 'old API' };
};

const getConsultCouponList: Resolver<
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

export const validateConsultCouponResolvers = {
  Query: {
    validateConsultCoupon,
    getConsultCouponList,
  },
};
