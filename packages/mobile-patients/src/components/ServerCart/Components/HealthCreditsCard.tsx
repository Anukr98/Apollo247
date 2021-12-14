import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { OneApollo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useFetchHealthCredits } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useFetchHealthCredits';

const windowHeight = Dimensions.get('window').height;

export interface HealthCreditsCardProps {}

export const HealthCreditsCard: React.FC<HealthCreditsCardProps> = (props) => {
  const { healthCredits: availableHC } = useFetchHealthCredits('pharma');
  const { serverCartAmount } = useShoppingCart();
  const getFormattedAmount = (num: number) => Number(num.toFixed(2));
  const cartTotal = serverCartAmount?.cartTotal || 0;
  const estimatedAmount = serverCartAmount?.estimatedAmount || 0;

  const amountToPay =
    availableHC >= getFormattedAmount(cartTotal)
      ? getFormattedAmount(estimatedAmount)
      : getFormattedAmount(cartTotal - availableHC);

  return availableHC != 0 ? (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <OneApollo style={styles.iconSize} />
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.availableHCTxt}>
          Available Health Credits <Text style={styles.hc}> ₹{availableHC}</Text>
        </Text>
        <Text style={styles.priceTxt}>
          Effective Price to Pay <Text style={styles.toPay}> ₹{amountToPay}</Text>
        </Text>
      </View>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    flexDirection: 'row',
    marginTop: 10,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 0,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  iconSize: {
    height: 0.053 * windowHeight,
    width: 0.068 * windowHeight,
  },
  iconContainer: {
    marginLeft: 10,
    paddingRight: 25,
    borderRightWidth: 1,
    borderRightColor: 'rgba(2, 71, 91, 0.5)',
    justifyContent: 'center',
  },
  priceTxt: {
    ...theme.fonts.IBMPlexSansRegular(10),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 16,
    textAlignVertical: 'center',
  },
  availableHCTxt: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 17,
    textAlignVertical: 'center',
  },
  hc: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 24,
    color: '#00B38E',
  },
  toPay: {
    ...theme.fonts.IBMPlexSansSemiBold(11),
    fontWeight: '600',
    lineHeight: 16,
    color: '#01475B',
    textAlignVertical: 'center',
  },
});
