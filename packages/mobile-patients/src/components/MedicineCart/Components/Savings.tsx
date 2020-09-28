import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface SavingsProps {}

export const Savings: React.FC<SavingsProps> = (props) => {
  const { couponDiscount, productDiscount, deliveryCharges } = useShoppingCart();
  const deliveryFee = AppConfig.Configuration.DELIVERY_CHARGES;

  function getSavings() {
    return Number(
      (
        (couponDiscount && couponDiscount) +
        (productDiscount && productDiscount) +
        (deliveryCharges == 0 ? deliveryFee : 0)
      ).toFixed(2)
    );
  }

  return getSavings() && getSavings() != 0 ? (
    <View style={styles.savingsCard}>
      <Text style={{ ...theme.fonts.IBMPlexSansRegular(13), lineHeight: 17, color: '#00B38E' }}>
        You{' '}
        <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(13), lineHeight: 17, color: '#00B38E' }}>
          saved ₹{getSavings()}
        </Text>{' '}
        on your purchase
      </Text>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  savingsCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
});
