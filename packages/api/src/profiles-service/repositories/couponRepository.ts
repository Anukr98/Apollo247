import { EntityRepository, Repository } from 'typeorm';
import { Coupon } from 'profiles-service/entities';
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
        code,
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
