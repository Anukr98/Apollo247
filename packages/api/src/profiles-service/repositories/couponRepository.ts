import { EntityRepository, Repository, Raw, IsNull, Not } from 'typeorm';
import { Coupon, ReferralCodesMaster, ReferalCouponMapping } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getCache, setCache } from 'profiles-service/database/connectRedis';
import { ApiConstants } from 'ApiConstants';

@EntityRepository(Coupon)
export class CouponRepository extends Repository<Coupon> {
  async getActiveCoupons() {
    return this.find({
      where: {
        isActive: 'true',
        couponConsultRule: Not(IsNull()),
        displayStatus: true,
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

  async findPharmaCouponByCode(code: string) {
    return this.findOne({
      where: {
        isActive: 'true',
        code: Raw((alias) => `${alias} ILIKE '${code}'`),
      },
      order: {
        createdDate: 'DESC',
      },
      relations: ['couponPharmaRule', 'couponGenericRule'],
    }).catch((getCouponsError) => {
      throw new AphError(AphErrorMessages.GET_COUPONS_ERROR, undefined, {
        getCouponsError,
      });
    });
  }

  async getPharmaActiveCoupons() {
    return this.find({
      where: {
        isActive: 'true',
        couponPharmaRule: Not(IsNull()),
      },
      order: {
        createdDate: 'DESC',
      },
      relations: ['couponPharmaRule', 'couponGenericRule'],
    }).catch((getCouponsError) => {
      throw new AphError(AphErrorMessages.GET_COUPONS_ERROR, undefined, {
        getCouponsError,
      });
    });
  }
}
const REDIS_REFERRAL_CODES_MASTER_NAME_KEY_PREFIX: string = 'ReferalCodeMaster:name:';
const REDIS_REFERRAL_CODES_MASTER_ID_KEY_PREFIX: string = 'ReferalCodeMaster:id:';
@EntityRepository(ReferralCodesMaster)
export class ReferralCodesMasterRepository extends Repository<ReferralCodesMaster> {
  async findByReferralCode(name: string) {
    const referalCode = await getCache(`${REDIS_REFERRAL_CODES_MASTER_NAME_KEY_PREFIX}${name}`);
    if (referalCode) {
      return JSON.parse(referalCode);
    } else {
      const referalCodefromDb = await this.findOne({
        where: { name },
        relations: ['referalCouponMapping'],
      });
      setCache(
        `${REDIS_REFERRAL_CODES_MASTER_NAME_KEY_PREFIX}${name}`,
        JSON.stringify(referalCodefromDb),
        ApiConstants.CACHE_EXPIRATION_14400
      );
      return referalCodefromDb;
    }
  }
}

@EntityRepository(ReferalCouponMapping)
export class ReferalCouponMappingRepository extends Repository<ReferalCouponMapping> {
  async findByReferralCodeId(referralcodeid: string) {
    const referalCode = await getCache(
      `${REDIS_REFERRAL_CODES_MASTER_ID_KEY_PREFIX}${referralcodeid}`
    );
    if (referalCode) {
      return JSON.parse(referalCode);
    } else {
      const referalCodefromDb = await this.findOne({
        where: {
          referralcodeid,
        },
        relations: ['coupon'],
      });
      setCache(
        `${REDIS_REFERRAL_CODES_MASTER_ID_KEY_PREFIX}${referralcodeid}`,
        JSON.stringify(referalCodefromDb),
        ApiConstants.CACHE_EXPIRATION_14400
      );
      return referalCodefromDb;
    }
  }
}
