export interface ValidateCouponRequest {
  mobile: string;
  billAmount: number;
  coupon: string;
  paymentType: string;
  pinCode: string;
  consultations: {
    hospitalId: string;
    doctorId: string;
    specialityId: string;
    consultationTime: number;
    consultationType: number;
    cost: number;
    rescheduling: boolean;
  }[];
}

export interface ValidateCouponResponse {
  errorCode: null | number;
  errorMsg: null | string;
  errorType: null;
  response: null | {
    mobile: number;
    coupon: string;
    consultationType: number;
    billAmount: number;
    paymentType: null | string;
    pinCode: string;
    consultations: [];
    products: {
      sku: number;
      categoryId: number;
      subCategoryId: number;
      mrp: number;
      specialPrice: number;
      quantity: number;
      totalCost: number;
    }[];
    diagnostics: [];
    discount: number;
    valid: boolean;
    reason: null | string;
  };
}

export interface AcceptCouponRequest {
  mobile: string;
  coupon: string;
}

export interface AcceptCouponResponse {
  errorCode: null | number;
  errorMsg: null | string;
  errorType: null | string;
  response: null | string;
}