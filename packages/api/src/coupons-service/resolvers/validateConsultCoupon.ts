import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { CouponConsultRulesRepository } from 'profiles-service/repositories/CouponConsultRulesRepository';
import { CouponGenericRulesRepository } from 'profiles-service/repositories/CouponGenericRulesRepository';
import { APPOINTMENT_TYPE } from 'consults-service/entities';
import { DiscountType } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';

export const validateConsultCouponTypeDefs = gql`
  enum AppointmentType {
    ONLINE
    PHYSICAL
    BOTH
  }

  type ValidateCodeResponse {
    validityStatus: Boolean!
    revisedAmount: String!
    reasonForInvalidStatus: String!
  }

  extend type Query {
    validateConsultCoupon(
      doctorId: ID!
      code: String!
      consultType: AppointmentType!
    ): ValidateCodeResponse
  }
`;

const validateConsultCoupon: Resolver<
  null,
  { code: string; doctorId: string; consultType: APPOINTMENT_TYPE },
  CouponServiceContext,
  { validityStatus: boolean; revisedAmount: number; reasonForInvalidStatus: string }
> = async (parent, args, { mobileNumber, patientsDb, doctorsDb, consultsDb }) => {
  //check for patient request validity
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.findByMobileNumber(mobileNumber);
  if (patientData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //get doctors Data
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepo.findById(args.doctorId);
  if (doctorData == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

  //get Doctor fees
  let doctorFees = 0;
  if (args.consultType === APPOINTMENT_TYPE.ONLINE)
    doctorFees = <number>doctorData.onlineConsultationFees;
  else doctorFees = <number>doctorData.physicalConsultationFees;

  //get coupon by code
  const couponRepo = patientsDb.getCustomRepository(CouponRepository);
  const couponData = await couponRepo.findCouponByCode(args.code);
  if (couponData == null)
    return {
      validityStatus: false,
      revisedAmount: doctorFees,
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
    };

  //console.log('couponData', couponData);

  //get coupon related generic rule
  const couponGenericRulesData = couponData.couponGenericRule;
  if (couponGenericRulesData == null)
    return {
      validityStatus: false,
      revisedAmount: doctorFees,
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
    };

  //get coupon related consult rule
  const couponRulesData = couponData.couponConsultRule;
  if (couponRulesData == null)
    return {
      validityStatus: false,
      revisedAmount: doctorFees,
      reasonForInvalidStatus: ApiConstants.INVALID_COUPON.toString(),
    };

  //check for coupon applicability as per rules configured
  //consult mode check
  if (
    couponRulesData.couponApplicability &&
    (args.consultType.toString() != couponRulesData.couponApplicability.toString() &&
      couponRulesData.couponApplicability.toString() != APPOINTMENT_TYPE.BOTH.toString() &&
      args.consultType.toString() != APPOINTMENT_TYPE.BOTH.toString())
  )
    return {
      validityStatus: false,
      revisedAmount: doctorFees,
      reasonForInvalidStatus: ApiConstants.COUPON_WITH_BU_RESTRICTION.replace(
        '{0}',
        couponRulesData.couponApplicability
      ).toString(),
    };

  //minimum cart value check
  if (
    couponGenericRulesData.minimumCartValue &&
    doctorFees < couponGenericRulesData.minimumCartValue
  )
    return {
      validityStatus: false,
      revisedAmount: doctorFees,
      reasonForInvalidStatus: ApiConstants.LOWER_CART_LIMIT.replace(
        '{0}',
        couponGenericRulesData.minimumCartValue.toString()
      ).toString(),
    };

  //maximum cart value check
  if (
    couponGenericRulesData.maximumCartValue &&
    doctorFees > couponGenericRulesData.maximumCartValue
  )
    return {
      validityStatus: false,
      revisedAmount: doctorFees,
      reasonForInvalidStatus: ApiConstants.UPPER_CART_LIMIT.replace(
        '{0}',
        couponGenericRulesData.maximumCartValue.toString()
      ).toString(),
    };

  //TODO : coupon count per customer check

  //TODO: total coupon count irrespective to customer

  //TODO: customer type check

  //TODO: coupon start date check

  //TODO: coupon end date check

  //discount amount calculation
  let revisedAmount = doctorFees;
  if (couponGenericRulesData.discountType && couponGenericRulesData.discountValue) {
    if (couponGenericRulesData.discountType === DiscountType.PERCENT) {
      revisedAmount = doctorFees - (doctorFees * couponGenericRulesData.discountValue) / 100;
    }
    if (
      couponGenericRulesData.discountType === DiscountType.PRICEOFF &&
      doctorFees > couponGenericRulesData.discountValue
    ) {
      revisedAmount = doctorFees - couponGenericRulesData.discountValue;
    }
    if (couponGenericRulesData.discountType === DiscountType.FLATPRICE) {
      revisedAmount = couponGenericRulesData.discountValue;
    }
  }

  return { validityStatus: true, revisedAmount: revisedAmount, reasonForInvalidStatus: '' };
};

export const validateConsultCouponResolvers = {
  Query: {
    validateConsultCoupon,
  },
};
