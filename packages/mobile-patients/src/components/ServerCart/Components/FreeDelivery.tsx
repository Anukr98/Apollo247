import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { FreeShippingIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface FreeDeliveryProps {}

export const FreeDelivery: React.FC<FreeDeliveryProps> = (props) => {
  const { serverCartAmount, cartCoupon, isCircleCart } = useShoppingCart();

  const showCard = () =>
    !serverCartAmount?.isDeliveryFree && !!serverCartAmount?.freeDeliveryAmount;

  function renderFreeDeliveryCard() {
    return !!isCircleCart && !!cartCoupon?.coupon ? null : (
      <View style={styles.card}>
        <FreeShippingIcon style={{ width: 15, height: 15, marginTop: 3, marginRight: 3 }} />
        <Text style={styles.deliveryText}>
          Add
          <Text style={styles.deliveryAmountText}>
            {' '}
            ₹{serverCartAmount?.freeDeliveryAmount?.toFixed(2)}{' '}
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
  deliveryText: {
    ...theme.viewStyles.text('M', 12, '#02475B', 1, 20, 0),
    alignSelf: 'center',
    flex: 1,
  },
  deliveryAmountText: {
    color: '#02475B',
    ...theme.fonts.IBMPlexSansBold(12),
  },
});
