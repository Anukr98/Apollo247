import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface AmountCardProps {}

export const AmountCard: React.FC<AmountCardProps> = (props) => {
  const {
    deliveryCharges,
    cartTotal,
    couponDiscount,
    productDiscount,
    grandTotal,
    circleMembershipCharges,
    isCircleSubscription,
  } = useShoppingCart();
  const deliveryFee = AppConfig.Configuration.DELIVERY_CHARGES;
  const renderCartTotal = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Cart total</Text>
        <Text style={styles.text}>₹{cartTotal.toFixed(2)}</Text>
      </View>
    );
  };

  const renderProductDiscount = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Product Discount</Text>
        <Text style={styles.discount}>-₹{productDiscount.toFixed(2)}</Text>
      </View>
    );
  };

  const renderCouponDiscount = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Coupon savings</Text>
        <Text style={styles.discount}>-₹{couponDiscount.toFixed(2)}</Text>
      </View>
    );
  };

  const renderDeliveryCharges = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text}>Delivery charges</Text>
        {deliveryCharges ? (
          <Text style={styles.text}>+₹{deliveryCharges.toFixed(2)}</Text>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.free}>Free</Text>
              {(isCircleSubscription || !!circleMembershipCharges) && (
                <Text
                  style={{
                    ...theme.viewStyles.text('R', 13, '#02475B', 1, 26),
                    marginLeft: 5,
                  }}
                >
                  for Circle Members
                </Text>
              )}
            </View>
            <Text style={{ ...styles.text, textDecorationLine: 'line-through', marginLeft: 5 }}>
              +₹{deliveryFee.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSeparator = () => {
    return <View style={styles.separator}></View>;
  };

  const renderToPay = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.toPay}>To Pay</Text>
        <Text style={styles.toPay}>₹{grandTotal.toFixed(2)}</Text>
      </View>
    );
  };

  const renderCircleMembershipCharges = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={styles.text}>Circle Membership</Text>
      <Text style={styles.text}>₹{circleMembershipCharges}</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      {renderCartTotal()}
      {productDiscount > 0 && renderProductDiscount()}
      {couponDiscount > 0 && renderCouponDiscount()}
      {!!circleMembershipCharges && renderCircleMembershipCharges()}
      {renderDeliveryCharges()}
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
});
