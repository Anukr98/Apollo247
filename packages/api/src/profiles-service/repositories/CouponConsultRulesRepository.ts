import { EntityRepository, Repository } from 'typeorm';
import { CouponConsultRules } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(CouponConsultRules)
export class CouponConsultRulesRepository extends Repository<CouponConsultRules> {
  async findRuleById(id: CouponConsultRules) {
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
