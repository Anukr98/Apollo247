import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface CartTotalSectionProps {}

export const CartTotalSection: React.FC<CartTotalSectionProps> = (props) => {
  const { cartSubscriptionDetails, serverCartAmount, isCircleCart } = useShoppingCart();
  const isCircleAddedToCart =
    (!!cartSubscriptionDetails?.currentSellingPrice &&
      !!cartSubscriptionDetails?.subscriptionApplied) ||
    false;
  const cartTotal = serverCartAmount?.cartTotal || 0;
  const cartSavings = serverCartAmount?.cartSavings || 0;
  const couponSavings = serverCartAmount?.couponSavings || 0;
  const deliveryCharges = serverCartAmount?.deliveryCharges || 0;
  const estimatedAmount = serverCartAmount?.estimatedAmount || 0;
  const isDeliveryFree = serverCartAmount?.isDeliveryFree || false;
  const packagingCharges = serverCartAmount?.packagingCharges || 0;

  const renderCartTotal = () => {
    return cartTotal ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Cart total</Text>
        <Text style={styles.text}>₹{cartTotal?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderProductDiscount = () => {
    return cartSavings ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Product Discount</Text>
        <Text style={styles.discount}>-₹{cartSavings?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderCouponDiscount = () => {
    return couponSavings ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Coupon savings</Text>
        <Text style={styles.discount}>-₹{couponSavings?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderDeliveryCharges = () => {
    return deliveryCharges ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.text}>Delivery charges</Text>
          {isCircleCart && !!cartSubscriptionDetails?.subscriptionApplied ? (
            <Text style={styles.circleMessage}>(Free for Circle Members)</Text>
          ) : null}
        </View>
        {deliveryCharges && !isDeliveryFree ? (
          <Text style={styles.text}>+₹{deliveryCharges?.toFixed(2)}</Text>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.free}>Free</Text>
            <Text style={{ ...styles.text, textDecorationLine: 'line-through', marginLeft: 5 }}>
              +₹{deliveryCharges?.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    ) : null;
  };

  const renderPackagingCharges = () => {
    return packagingCharges ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Packaging Charges</Text>
        <Text style={styles.text}>+₹{packagingCharges?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderSeparator = () => {
    return <View style={styles.separator}></View>;
  };

  const renderToPay = () => {
    return estimatedAmount ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.toPay}>To Pay</Text>
        <Text style={styles.toPay}>₹{estimatedAmount?.toFixed(2)}</Text>
      </View>
    ) : null;
  };

  const renderCircleMembershipCharges = () =>
    isCircleAddedToCart ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Circle Membership</Text>
        <Text style={styles.text}>₹{cartSubscriptionDetails?.currentSellingPrice?.toFixed(2)}</Text>
      </View>
    ) : null;

  return (
    <View style={styles.card}>
      {renderCartTotal()}
      {renderProductDiscount()}
      {renderCouponDiscount()}
      {!!isCircleAddedToCart && renderCircleMembershipCharges()}
      {!!deliveryCharges && renderDeliveryCharges()}
      {renderPackagingCharges()}
      {renderSeparator()}
      {renderToPay()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  text: {
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 24,
    color: '#01475B',
  },
  discount: {
    color: '#00B38E',
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  free: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 24,
    color: '#00B38E',
  },
  separator: {
    borderWidth: 0.5,
    borderColor: '#02475B',
    opacity: 0.2,
    marginTop: 4,
    marginBottom: 6,
  },
  toPay: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    fontWeight: '600',
    lineHeight: 24,
    color: '#01475B',
  },
  circleMessage: {
    ...theme.viewStyles.text('L', 12, '#02475B', 1, 17),
  },
});
