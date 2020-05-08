import { DiscountType, CouponGenericRules } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';

export function discountCalculation(
  actualAmount: number,
  discountType: DiscountType,
  discountValue: number
): number {
  let revisedAmount = actualAmount;
  if (discountType === DiscountType.PERCENT) {
    revisedAmount = actualAmount - (actualAmount * discountValue) / 100;
  }
  if (discountType === DiscountType.PRICEOFF) {
    if (actualAmount > discountValue) {
      revisedAmount = actualAmount - discountValue;
    } else {
      revisedAmount = 0;
    }
  }

  if (discountType === DiscountType.FLATPRICE) {
    revisedAmount = discountValue;
  }
  return revisedAmount;
}

type Result = {
  validityStatus: boolean;
  reasonForInvalidStatus: string;
};

export function genericRuleCheck(
  couponGenericRulesData: CouponGenericRules,
  amount: number
): Result | undefined {
  //minimum cart value check
  if (couponGenericRulesData.minimumCartValue && amount < couponGenericRulesData.minimumCartValue)
    return {
      validityStatus: false,
      reasonForInvalidStatus: ApiConstants.LOWER_CART_LIMIT.replace(
        '{0}',
        couponGenericRulesData.minimumCartValue.toString()
      ).toString(),
    };

  //maximum cart value check
  if (couponGenericRulesData.maximumCartValue && amount > couponGenericRulesData.maximumCartValue)
    return {
      validityStatus: false,
      reasonForInvalidStatus: ApiConstants.UPPER_CART_LIMIT.replace(
        '{0}',
        couponGenericRulesData.maximumCartValue.toString()
      ).toString(),
    };

  //coupon start date check
  const todayDate = new Date();
  if (
    couponGenericRulesData.couponStartDate &&
    todayDate < couponGenericRulesData.couponStartDate
  ) {
    return {
      validityStatus: false,
      reasonForInvalidStatus: ApiConstants.EARLY_COUPON.toString(),
    };
  }

  // coupon end date check
  if (couponGenericRulesData.couponEndDate && todayDate > couponGenericRulesData.couponEndDate) {
    return {
      validityStatus: false,
      reasonForInvalidStatus: ApiConstants.COUPON_EXPIRED.toString(),
    };
  }
}
