import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { CouponConsultRulesRepository } from 'profiles-service/repositories/CouponConsultRulesRepository';
import { CouponGenericRulesRepository } from 'profiles-service/repositories/CouponGenericRulesRepository';
import { APPOINTMENT_TYPE } from 'consults-service/entities';
import { DiscountType } from 'profiles-service/entities';

export const validateConsultCouponTypeDefs = gql`
  type ValidateCodeResponse {
    validityStatus: Boolean!
    revisedAmount: String!
  }

  extend type Query {
    validateConsultCoupon(appointmentId: ID!, Code: String!): ValidateCodeResponse
  }
`;

const validateConsultCoupon: Resolver<
  null,
  { appointmentId: string; code: string },
  CouponServiceContext,
  { validityStatus: boolean; revisedAmount: number }
> = async (parent, args, { mobileNumber, patientsDb, doctorsDb, consultsDb }) => {
  //check for patient request validity
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.findByMobileNumber(mobileNumber);
  if (patientData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //check appointment validity
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get doctors Data
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepo.findById(appointmentData.doctorId);
  if (doctorData == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

  //get coupon by code
  const couponRepo = patientsDb.getCustomRepository(CouponRepository);
  const couponData = await couponRepo.findCouponByCode(args.code);
  if (couponData == null) throw new AphError(AphErrorMessages.INVALID_COUPON_CODE);

  //get coupon related generic rule
  const couponGenericRuleRepo = patientsDb.getCustomRepository(CouponGenericRulesRepository);
  const couponGenericRulesData = await couponGenericRuleRepo.findRuleById(
    couponData.couponGenericRule
  );
  if (couponGenericRulesData == null) throw new AphError(AphErrorMessages.INVALID_COUPON_CODE);

  //get coupon related consult rule
  const couponRuleRepo = patientsDb.getCustomRepository(CouponConsultRulesRepository);
  const couponRulesData = await couponRuleRepo.findRuleById(couponData.couponConsultRule);
  if (couponRulesData == null) throw new AphError(AphErrorMessages.INVALID_COUPON_CODE);

  //get Doctor fees
  let doctorFees = 0;
  if (appointmentData.appointmentType === APPOINTMENT_TYPE.ONLINE)
    doctorFees = <number>doctorData.onlineConsultationFees;
  else doctorFees = <number>doctorData.physicalConsultationFees;

  //check for coupon applicability as per rules configured

  //consult mode check
  if (
    couponRulesData.couponApplicability &&
    appointmentData.appointmentType.toString() !== couponRulesData.couponApplicability.toString()
  )
    return { validityStatus: false, revisedAmount: doctorFees };

  //minimum cart value check
  if (
    couponGenericRulesData.minimumCartValue &&
    doctorFees < couponGenericRulesData.minimumCartValue
  )
    return { validityStatus: false, revisedAmount: doctorFees };

  //maximum cart value check
  if (
    couponGenericRulesData.maximumCartValue &&
    doctorFees > couponGenericRulesData.maximumCartValue
  )
    return { validityStatus: false, revisedAmount: doctorFees };

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

  return { validityStatus: true, revisedAmount: revisedAmount };
};

export const validateConsultCouponResolvers = {
  Query: {
    validateConsultCoupon,
  },
};
