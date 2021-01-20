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
}

export const Coupon: React.FC<CouponProps> = (props) => {
  const {
    coupon,
    couponDiscount,
    isProuctFreeCouponApplied,
    isCircleSubscription,
    circleMembershipCharges,
  } = useShoppingCart();
  const { onPressApplyCoupon, onPressRemove } = props;

  const renderApplyCoupon = () => {
    return (
      <View>
        <TouchableOpacity style={styles.applyCoupon} onPress={onPressApplyCoupon}>
          <View style={styles.rowStyle}>
            <CouponIcon />
            <Text style={styles.applyCouponText}>Apply Coupon</Text>
          </View>
          <ArrowRight />
        </TouchableOpacity>
        {(!!isCircleSubscription || !!circleMembershipCharges) && renderCareMessage()}
      </View>
    );
  };

  const renderCareMessage = () => (
    <View style={styles.careMessageContainer}>
      <Text style={styles.removeCircleText}>
        You can either use Circle benefits or apply a Coupon code
      </Text>
    </View>
  );

  const renderCouponMsg = () => {
    return !isProuctFreeCouponApplied ? (
      <Text style={styles.applicable}>
        {couponDiscount > 0
          ? coupon?.message
            ? `(${coupon?.message})`
            : `(Savings of ₹ ${Number(couponDiscount).toFixed(2)})`
          : '(Coupon not applicable on your cart item(s) or item(s) with already higher discounts)'}
      </Text>
    ) : coupon?.message ? (
      <Text style={styles.applicable}>{`(${coupon?.message})`}</Text>
    ) : null;
  };

  const renderCouponApplied = () => {
    return (
      <TouchableOpacity style={styles.couponApplied} onPress={onPressApplyCoupon}>
        <View style={styles.rowStyle}>
          <CouponIcon style={{ marginVertical: 10 }} />
          <View style={{ marginLeft: 10, marginVertical: 4 }}>
            <Text style={styles.couponAppliedText}>
              {couponDiscount > 0
                ? `Coupon Applied : ${coupon?.coupon}`
                : `Coupon : ${coupon?.coupon}`}
            </Text>
            {renderCouponMsg()}
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
  careMessageContainer: {
    flexDirection: 'row',
    marginLeft: 8,
    paddingBottom: 7,
    justifyContent: 'flex-start',
  },
  pendingIconStyle: {
    marginRight: 10,
    marginTop: 5,
  },
  removeCircleText: {
    width: '85%',
    marginLeft: 40,
    ...theme.viewStyles.text('M', 13, '#02475B', 1, 17),
    flexWrap: 'wrap',
  },
});