import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { FreeShippingIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface FreeDeliveryProps {}

export const FreeDelivery: React.FC<FreeDeliveryProps> = (props) => {
  const {
    cartItems,
    cartTotal,
    couponDiscount,
    productDiscount,
    isCircleSubscription,
    circleMembershipCharges,
    coupon,
  } = useShoppingCart();
  const minValuetoNudgeUsers =
    AppConfig.Configuration.MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY;
  const minValueForFreeDelivery = AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY;
  const amountToPay = cartTotal - couponDiscount - productDiscount;

  function showCard() {
    return (
      cartItems.length > 0 &&
      amountToPay >= minValuetoNudgeUsers &&
      amountToPay < minValueForFreeDelivery
    );
  }

  function getToAdd() {
    return (minValueForFreeDelivery - amountToPay).toFixed(2);
  }

  function renderFreeDeliveryCard() {
    return (!!isCircleSubscription || circleMembershipCharges) &&
      (!coupon || coupon.circleBenefits) ? null : (
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

  return showCard() || circleMembershipCharges ? renderFreeDeliveryCard() : null;
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
