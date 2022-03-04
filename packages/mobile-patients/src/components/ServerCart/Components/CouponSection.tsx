import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { ArrowRight, CouponIcon, Cross } from '@aph/mobile-patients/src/components/ui/Icons';
import { CouponOfferMessage } from '@aph/mobile-patients/src/components/ServerCart/Components/CouponOfferMessage';

export interface CouponSectionProps {
  onPressApplyCoupon: () => void;
  onPressRemove: () => void;
  movedFrom?: 'subscription' | 'pharmacy';
  showOnPressApplyCouponMessage?: boolean;
}

export const CouponSection: React.FC<CouponSectionProps> = (props) => {
  const { cartCoupon, serverCartAmount } = useShoppingCart();
  const { onPressApplyCoupon, onPressRemove, movedFrom, showOnPressApplyCouponMessage } = props;
  const isFromSubscription = movedFrom == 'subscription';
  const selectAddressText = 'Please select delivery address to view coupons';

  const renderApplyCoupon = () => {
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.applyCoupon}
          onPress={onPressApplyCoupon}
        >
          <View style={styles.rowStyle}>
            <CouponIcon style={{ alignSelf: 'flex-start' }} />
            <View>
              <Text style={styles.applyCouponText}>Apply Coupon</Text>
              <CouponOfferMessage movedFrom={movedFrom} />
              {showOnPressApplyCouponMessage ? (
                <Text style={styles.selectAddressText}>{selectAddressText}</Text>
              ) : null}
            </View>
          </View>
          <ArrowRight style={{ alignSelf: 'flex-start' }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCouponMsg = () => {
    if (cartCoupon?.couponMessage || cartCoupon?.reason) {
      return (
        <Text style={theme.viewStyles.text('M', 13, '#01475B', 1, 27)}>
          {cartCoupon?.couponMessage || cartCoupon?.reason}
        </Text>
      );
    } else if (serverCartAmount?.couponSavings) {
      return (
        <Text
          style={theme.viewStyles.text('M', 13, '#01475B', 1, 27)}
        >{`(Savings of ₹ ${serverCartAmount?.couponSavings})`}</Text>
      );
    } else return null;
  };

  const renderCouponApplied = () => {
    const couponDiscount = serverCartAmount?.couponSavings || 0;
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
                ? `Coupon Applied : ${cartCoupon?.coupon}`
                : `Coupon : ${cartCoupon?.coupon}`}
            </Text>
            {renderCouponMsg()}
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
      {!cartCoupon?.valid ? renderApplyCoupon() : renderCouponApplied()}
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
  selectAddressText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.APP_RED,
    paddingVertical: 5,
    paddingLeft: 10,
  },
});
