import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  ArrowRight,
  CouponIcon,
  Cross,
  PendingIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

export interface CouponProps {
  onPressApplyCoupon: () => void;
  onPressRemove: () => void;
  movedFrom?: string;
}

export const Coupon: React.FC<CouponProps> = (props) => {
  const {
    coupon,
    couponDiscount,
    isProuctFreeCouponApplied,
    subscriptionCoupon,
  } = useShoppingCart();
  const { onPressApplyCoupon, onPressRemove, movedFrom } = props;
  const isFromSubscription = movedFrom == 'subscription';

  const renderApplyCoupon = () => {
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.applyCoupon}
          onPress={onPressApplyCoupon}
        >
          <View style={styles.rowStyle}>
            <CouponIcon />
            <Text style={styles.applyCouponText}>Apply Coupon</Text>
          </View>
          <ArrowRight />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCouponMsg = () => {
    const currentCoupon = isFromSubscription ? subscriptionCoupon : coupon;
    const discountAmount = isFromSubscription
      ? subscriptionCoupon?.discount
      : Number(couponDiscount).toFixed(2);
    return !isProuctFreeCouponApplied ? (
      <Text style={styles.applicable}>
        {couponDiscount > 0 || isFromSubscription
          ? currentCoupon?.message
            ? `(${currentCoupon?.message})`
            : `(Savings of ₹ ${discountAmount})`
          : '(Coupon not applicable on your cart item(s) or item(s) with already higher discounts)'}
      </Text>
    ) : currentCoupon?.message || isFromSubscription ? (
      <Text style={styles.applicable}>
        {isFromSubscription ? `(${subscriptionCoupon?.message})` : `(${currentCoupon?.message})`}
      </Text>
    ) : null;
  };

  const renderCouponApplied = () => {
    const currentCoupon = isFromSubscription ? subscriptionCoupon : coupon;
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.couponApplied}
        onPress={onPressApplyCoupon}
      >
        <View style={styles.rowStyle}>
          <CouponIcon style={{ marginVertical: 10 }} />
          <View style={styles.couponMessageContainer}>
            <Text style={styles.couponAppliedText}>
              {couponDiscount > 0
                ? `Coupon Applied : ${currentCoupon?.coupon}`
                : `Coupon : ${currentCoupon?.coupon}`}
            </Text>
            {renderCouponMsg()}
            {!!currentCoupon?.successMessage && (
              <View style={styles.couponSuccessMessageContainer}>
                <Text
                  style={theme.viewStyles.text('M', 13, '#01475B', 1, 27)}
                >{`(${currentCoupon?.successMessage})`}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.5} style={{ marginTop: 10 }} onPress={onPressRemove}>
          <Cross />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.couponCard, isFromSubscription ? { marginHorizontal: 20 } : {}]}>
      {!coupon && !subscriptionCoupon ? renderApplyCoupon() : renderCouponApplied()}
    </View>
  );
};

const styles = StyleSheet.create({
  couponCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 5,
  },
  applyCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  applyCouponText: {
    color: '#01475B',
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    marginLeft: 10,
  },
  couponApplied: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 179, 142, 0.2)',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  couponAppliedText: {
    color: '#01475B',
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
  },
  applicable: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: '#01475B',
    marginVertical: 5,
    lineHeight: 18,
  },
  rowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pendingIconStyle: {
    marginRight: 10,
    marginTop: 5,
  },
  couponSuccessMessageContainer: {
    marginTop: 7,
    borderTopColor: theme.colors.BORDER_BOTTOM_COLOR,
    borderTopWidth: 0.5,
    justifyContent: 'center',
  },
  couponMessageContainer: { marginLeft: 10, marginVertical: 4, flex: 1 },
});
