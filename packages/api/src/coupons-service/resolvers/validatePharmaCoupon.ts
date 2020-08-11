import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { CouponCategoryApplicable } from 'profiles-service/entities';
import { getCouponsList, validateCoupon } from 'helpers/couponServices';
import { CouponProduct, ValidateCouponRequestPharma } from 'types/coupons';

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

  let billAmount = 0;
  const couponProduct: CouponProduct[] = [];
  let mrpPriceTotal = 0;
  let specialPriceTotal = 0;

  //calculate total amount
  orderLineItems.map((item) => {
    const amountToBeConsidered = item.specialPrice < item.mrp ? item.specialPrice : item.mrp;
    billAmount = billAmount + amountToBeConsidered * item.quantity;

    const product: CouponProduct = {
      sku: parseInt(item.itemId, 10),
      mrp: item.mrp,
      specialPrice: item.specialPrice,
      quantity: item.quantity,
      totalCost: amountToBeConsidered * item.quantity,
    };
    couponProduct.push(product);
  });

  //build product array

  const payload: ValidateCouponRequestPharma = {
    mobile: patientData.mobileNumber.replace('+91', ''),
    email: patientData.emailAddress,
    billAmount: billAmount,
    coupon: code,
    paymentType: '',
    pinCode: '',
    products: couponProduct,
  };

  const couponData = await validateCoupon(payload);

  let validityStatus = false;
  let reasonForInvalidStatus = '';
  const lineItemsWithDiscount: PharmaLineItems[] = [];

  if (couponData && couponData.response) {
    validityStatus = couponData.response.valid;
    reasonForInvalidStatus = couponData.response.reason || '';
    couponData.response.products.map((item) => {
      const orderLineItemData = orderLineItems.filter(
        (item1) => item1.itemId == item.sku.toString()
      );
      mrpPriceTotal = mrpPriceTotal + item.mrp * item.quantity;
      specialPriceTotal = specialPriceTotal + item.specialPrice * item.quantity;

      const lineItems: PharmaLineItems = {
        applicablePrice: Number((item.mrp - item.discountAmt).toFixed(2)),
        discountedPrice: Number(item.discountAmt.toFixed(2)),
        itemId: item.sku ? item.sku.toString() : '',
        mrp: item.mrp,
        productName: orderLineItemData.length ? orderLineItemData[0].productName : '',
        productType: orderLineItemData.length
          ? orderLineItemData[0].productType
          : CouponCategoryApplicable.PHARMA_FMCG,
        quantity: item.quantity,
        specialPrice: item.specialPrice,
      };
      lineItemsWithDiscount.push(lineItems);
    });
  }

  const productDiscount = Number((mrpPriceTotal - specialPriceTotal).toFixed(2));
  const totalDiscountPrice = mrpPriceTotal - couponData.response!.discount;

  const discountedTotals: DiscountedTotals = {
    couponDiscount: Number((totalDiscountPrice - productDiscount).toFixed(2)),
    mrpPriceTotal: mrpPriceTotal,
    productDiscount: productDiscount,
  };

  return {
    discountedTotals: discountedTotals,
    pharmaLineItemsWithDiscountedPrice: lineItemsWithDiscount,
    successMessage: '',
    reasonForInvalidStatus: reasonForInvalidStatus,
    validityStatus: validityStatus,
  };
};

type CouponData = {
  code: string;
  couponPharmaRule: {
    messageOnCouponScreen: string;
  };
  couponGenericRule: {
    isActive: boolean;
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
      couponGenericRule: {
        isActive: true,
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
