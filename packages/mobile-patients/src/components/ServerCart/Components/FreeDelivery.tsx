import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { FreeShippingIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface FreeDeliveryProps {}

export const FreeDelivery: React.FC<FreeDeliveryProps> = (props) => {
  const {
    serverCartItems,
    serverCartAmount,
    cartSubscriptionDetails,
    cartCoupon,
  } = useShoppingCart();

  const cartTotal = serverCartAmount?.cartTotal || 0;
  const cartSavings = serverCartAmount?.cartSavings || 0;
  const couponSavings = serverCartAmount?.couponSavings || 0;
  const isCircleCart =
    (cartSubscriptionDetails?.currentSellingPrice &&
      cartSubscriptionDetails?.subscriptionApplied) ||
    cartSubscriptionDetails?.userSubscriptionId;

  const amountToPay = cartTotal - couponSavings - cartSavings;

  function showCard() {
    return serverCartItems.length > 0 && !serverCartAmount?.isDeliveryFree;
  }

  function getToAdd() {
    return '0'; // (minValueForFreeDelivery - amountToPay).toFixed(2);
  }

  function renderFreeDeliveryCard() {
    return !!isCircleCart && !!cartCoupon?.coupon ? null : (
      <View style={styles.card}>
        <FreeShippingIcon style={{ width: 15, height: 15, marginTop: 3, marginRight: 3 }} />
        <Text
          style={{
            ...theme.viewStyles.text('M', 12, '#02475B', 1, 20, 0),
            alignSelf: 'center',
            flex: 1,
          }}
        >
          Add
          <Text style={{ color: '#02475B', ...theme.fonts.IBMPlexSansBold(12) }}>
            {' '}
            ₹{getToAdd()}{' '}
          </Text>
          of eligible items to your order to qualify for FREE Delivery
        </Text>
      </View>
    );
  }

  return showCard() ? renderFreeDeliveryCard() : null;
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#F7F8F5',
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 5,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  careTextContainer: {
    flexDirection: 'row',
  },
  careRedBox: {
    width: 25,
    height: 25,
    backgroundColor: '#F0533B',
    borderRadius: 5,
    marginRight: 10,
  },
  getCareText: {
    ...theme.viewStyles.text('M', 13, '#02475B', 1, 20),
    flexWrap: 'wrap',
  },
  careCashbackContainer: {
    ...theme.viewStyles.cardViewStyle,
    margin: 15,
    padding: 5,
  },
  careCashbackText: {
    ...theme.viewStyles.text('M', 14, '#02475B', 1, 17),
    paddingVertical: 15,
  },
  careCashbackLogo: {
    resizeMode: 'contain',
    marginLeft: 5,
    width: 50,
    height: 45,
  },
});
