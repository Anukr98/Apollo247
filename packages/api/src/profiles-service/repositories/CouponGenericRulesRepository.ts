import { EntityRepository, Repository } from 'typeorm';
import { CouponGenericRules } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(CouponGenericRules)
export class CouponGenericRulesRepository extends Repository<CouponGenericRules> {
  async findRuleById(id: CouponGenericRules) {
    return this.findOne({
      where: {
        isActive: 'true',
        id,
      },
      order: {
        createdDate: 'DESC',
      },
    }).catch((getCouponsError) => {
      throw new AphError(AphErrorMessages.GET_CONSULT_COUPON_RULES_ERROR, undefined, {
        getCouponsError,
      });
    });
  }
}
