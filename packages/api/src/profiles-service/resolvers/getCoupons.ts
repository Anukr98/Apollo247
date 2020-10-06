import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Coupon } from 'profiles-service/entities';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';

export const getCouponsTypeDefs = gql`
  enum DiscountType {
    FLATPRICE
    PERCENT
    PRICEOFF
  }

  type Coupon {
    id: ID!
    code: String!
    description: String
    discountType: DiscountType!
    discount: Float!
    minimumOrderAmount: Float
    expirationDate: Date
    isActive: Boolean
  }

  type CouponsResult {
    coupons: [Coupon]
  }
  extend type Query {
    getCoupons: CouponsResult
  }
`;

type CouponsResult = {
  coupons: Coupon[];
};

const getCoupons: Resolver<null, {}, ProfilesServiceContext, CouponsResult> = async (
  parent,
  args,
  { profilesDb, doctorsDb }
) => {
  const couponsRepo = profilesDb.getCustomRepository(CouponRepository);
  const coupons = await couponsRepo.getActiveCoupons();
  return { coupons };
};

export const getCouponsResolvers = {
  Query: {
    getCoupons,
  },
};
