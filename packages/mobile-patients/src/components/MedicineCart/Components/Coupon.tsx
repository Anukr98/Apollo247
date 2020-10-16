import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { ArrowRight, CouponIcon, Cross } from '@aph/mobile-patients/src/components/ui/Icons';

export interface CouponProps {
  onPressApplyCoupon: () => void;
  onPressRemove: () => void;
}

export const Coupon: React.FC<CouponProps> = (props) => {
  const { coupon, couponDiscount } = useShoppingCart();
  const { onPressApplyCoupon, onPressRemove } = props;

  const renderApplyCoupon = () => {
    return (
      <TouchableOpacity style={styles.applyCoupon} onPress={onPressApplyCoupon}>
        <View style={styles.rowStyle}>
          <CouponIcon />
          <Text style={styles.applyCouponText}>Apply Coupon</Text>
        </View>
        <ArrowRight />
      </TouchableOpacity>
    );
  };

  const renderCouponApplied = () => {
    return (
      <TouchableOpacity style={styles.couponApplied} onPress={onPressApplyCoupon}>
        <View style={styles.rowStyle}>
          <CouponIcon />
          <View style={{ marginLeft: 10, marginVertical: 4 }}>
            <Text style={styles.couponAppliedText}>
              {couponDiscount > 0
                ? `Coupon Applied : ${coupon?.coupon}`
                : `Coupon : ${coupon?.coupon}`}{' '}
            </Text>
            <Text style={styles.applicable}>
              {couponDiscount > 0
                ? coupon?.message
                  ? `(${coupon?.message})`
                  : `(Savings of ₹ ${Number(couponDiscount).toFixed(2)})`
                : '(Coupon not applicable on your cart item(s) or item(s) with already higher discounts)'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={{ marginTop: 10 }} onPress={onPressRemove}>
          <Cross />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.couponCard}>{!coupon ? renderApplyCoupon() : renderCouponApplied()}</View>
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
  },
  applyCouponText: {
    color: '#01475B',
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    marginVertical: 16,
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
});
