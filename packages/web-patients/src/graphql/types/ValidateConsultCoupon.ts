/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AppointmentType } from "./globalTypes";

// ====================================================
// GraphQL query operation: ValidateConsultCoupon
// ====================================================

export interface ValidateConsultCoupon_validateConsultCoupon {
  __typename: "ValidateCodeResponse";
  validityStatus: boolean;
  revisedAmount: string;
  reasonForInvalidStatus: string;
}

export interface ValidateConsultCoupon {
  validateConsultCoupon: ValidateConsultCoupon_validateConsultCoupon | null;
}

export interface ValidateConsultCouponVariables {
  doctorId: string;
  code: string;
  consultType: AppointmentType;
  appointmentDateTimeInUTC: any;
}
