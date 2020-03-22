import { EntityRepository, Repository, Raw } from 'typeorm';
import { Coupon, ReferralCodesMaster, ReferalCouponMapping } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(Coupon)
export class CouponRepository extends Repository<Coupon> {
  async getActiveCoupons() {
    return this.find({
      where: {
        isActive: 'true',
      },
      order: {
        createdDate: 'DESC',
      },
      relations: ['couponConsultRule', 'couponGenericRule'],
    }).catch((getCouponsError) => {
      throw new AphError(AphErrorMessages.GET_COUPONS_ERROR, undefined, {
        getCouponsError,
      });
    });
  }

  async findCouponByCode(code: string) {
    return this.findOne({
      where: {
        isActive: 'true',
        code: Raw((alias) => `${alias} ILIKE '${code}'`),
      },
      order: {
        createdDate: 'DESC',
      },
      relations: ['couponConsultRule', 'couponGenericRule'],
    }).catch((getCouponsError) => {
      throw new AphError(AphErrorMessages.GET_COUPONS_ERROR, undefined, {
        getCouponsError,
      });
    });
  }
}

@EntityRepository(ReferralCodesMaster)
export class ReferralCodesMasterRepository extends Repository<ReferralCodesMaster> {
  findByReferralCode(name: string) {
    return this.findOne({
      where: {
        name,
      },
      relations: ['referalCouponMapping'],
    }).catch((getCouponsError) => {
      throw new AphError(AphErrorMessages.GET_REFERRAL_CODE_ERROR, undefined, {
        getCouponsError,
      });
    });
  }
}

@EntityRepository(ReferalCouponMapping)
export class ReferalCouponMappingRepository extends Repository<ReferalCouponMapping> {
  findByReferralCodeId(referralcodeid: string) {
    return this.findOne({
      where: {
        referralcodeid,
      },
      relations: ['coupon'],
    }).catch((getCouponsError) => {
      throw new AphError(AphErrorMessages.GET_REFERRAL_CODE_MAPPING_ERROR, undefined, {
        getCouponsError,
      });
    });
  }
}
