import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { APPOINTMENT_TYPE } from 'consults-service/entities';
import { Coupon } from 'profiles-service/entities';
import { validateCoupon } from 'helpers/couponServices';
import { ValidateCouponRequest } from 'types/coupons';

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
  const { code, consultType, doctorId, appointmentDateTimeInUTC } = args;

  //check for patient request validity
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.findByMobileNumber(mobileNumber);
  if (patientData.length == 0) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  // //get doctors Data
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepo.findById(doctorId);
  if (doctorData == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

  const amount =
    consultType == APPOINTMENT_TYPE.PHYSICAL
      ? doctorData.physicalConsultationFees
      : doctorData.onlineConsultationFees;
  const payload: ValidateCouponRequest = {
    mobile: mobileNumber.replace('+91', ''),
    email: patientData[0].emailAddress,
    billAmount: parseInt(amount.toString(), 10),
    coupon: code,
    paymentType: '',
    pinCode: '',
    consultations: [
      {
        hospitalId: doctorData.doctorHospital[0].facility.id,
        doctorId: doctorData.id,
        specialityId: doctorData.specialty.id,
        consultationTime: appointmentDateTimeInUTC.getTime(),
        consultationType:
          consultType == APPOINTMENT_TYPE.ONLINE
            ? 1
            : consultType == APPOINTMENT_TYPE.PHYSICAL
            ? 0
            : -1,
        cost: parseInt(amount.toString(), 10),
        rescheduling: false,
      },
    ],
  };
  const couponData = await validateCoupon(payload);
  let validityStatus = false;
  let reasonForInvalidStatus = '';
  let revisedAmount = 0;
  if (couponData && couponData.response) validityStatus = couponData.response.valid;
  if (couponData && couponData.response)
    reasonForInvalidStatus = couponData.response.reason ? couponData.response.reason : '';
  if (couponData && couponData.response)
    revisedAmount = validityStatus
      ? couponData.response.billAmount - couponData.response.discount
      : 0;

  return { validityStatus, revisedAmount, reasonForInvalidStatus };
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
