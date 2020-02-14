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

export const validateConsultCouponTypeDefs = gql`
  type Validcode {
    validityStatus: Boolean
  }

  extend type Query {
    validateConsultCoupon(appointmentId: ID, code: String): Validcode
  }
`;

const validateConsultCoupon: Resolver<
  null,
  { appointmentId: string; code: string },
  CouponServiceContext,
  { validityStatus: boolean }
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

  //get coupon related rule
  const couponRuleRepo = patientsDb.getCustomRepository(CouponConsultRulesRepository);
  const couponRulesData = await couponRuleRepo.findRuleById(couponData.couponConsultRule);
  if (couponRulesData == null) throw new AphError(AphErrorMessages.INVALID_COUPON_CODE);

  //check for coupon applicability as per rules configured
  let validityStatus = true;

  //consult mode check
  if (
    couponRulesData.couponApplicability &&
    appointmentData.appointmentType.toString() !== couponRulesData.couponApplicability.toString()
  )
    validityStatus = false;

  //minimum cart value check

  return { validityStatus };
};

export const validateConsultCouponResolvers = {
  Query: {
    validateConsultCoupon,
  },
};
