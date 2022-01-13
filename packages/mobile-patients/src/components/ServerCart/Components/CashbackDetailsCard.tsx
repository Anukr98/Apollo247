import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_amountBreakUp } from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetailsWithAddress';

export interface CashbackDetailsProps {
  savingsClicked: boolean;
  triangleAlignmentValue: number;
  cashbackDetails?: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_amountBreakUp | null;
}

export const CashbackDetailsCard: React.FC<CashbackDetailsProps> = (props) => {
  const { savingsClicked, triangleAlignmentValue, cashbackDetails } = props;
  const { serverCartAmount, isCircleCart } = useShoppingCart();

  const cartSavings = serverCartAmount?.cartSavings || 0;
  const couponSavings = serverCartAmount?.couponSavings || 0;
  const deliveryCharges = serverCartAmount?.deliveryCharges || 0;
  const isDeliveryFree = serverCartAmount?.isDeliveryFree || 0;
  const couponCashBack = serverCartAmount?.couponCashBack || 0;
  const circleMembershipCashback = isCircleCart
    ? serverCartAmount?.circleSavings?.membershipCashBack || 0
    : 0;
  const healthCreditText = 'HCs will be credited after order delivery.';

  const inStyles = {
    triangle: {
      width: 15,
      height: 15,
      position: 'absolute',
      left: triangleAlignmentValue || 0,
      bottom: -14.5,
      borderLeftWidth: 12,
      borderLeftColor: theme.colors.CLEAR,
      borderRightWidth: 12,
      borderRightColor: theme.colors.CLEAR,
      borderBottomWidth: 12,
      borderBottomColor: theme.colors.SHADE_OF_GRAY,
      transform: [{ rotate: '180deg' }],
    },
    triangle2: {
      width: 15,
      height: 15,
      position: 'absolute',
      bottom: -14.5,
      left: triangleAlignmentValue + 1 || 0,
      borderLeftWidth: 11,
      borderLeftColor: theme.colors.CLEAR,
      borderRightWidth: 11,
      borderRightColor: theme.colors.CLEAR,
      borderBottomWidth: 11,
      borderBottomColor: theme.colors.HEX_WHITE,

      transform: [{ rotate: '180deg' }],
    },
  };

  const getRoundedOffAmount = (amount: string) => {
    if (amount.endsWith('.00')) {
      const roundedOffAmount = amount.split('.');
      return roundedOffAmount[0];
    } else {
      return amount;
    }
  };

  const renderHealthCreditsText = () => {
    return (
      <View>
        <Text numberOfLines={1} ellipsizeMode={'clip'} style={styles.textUnderline}>
          ---------------------------------------------------------------------------------------------------------------------------------------
        </Text>
        <View style={styles.healthCreditContainer}>
          <Text style={styles.healthCreditText}>{healthCreditText} </Text>
        </View>
      </View>
    );
  };

  const renderDiscountCashbackValue = (heading: string, value: number, circleContent?: boolean) => {
    const roundedOffValue = getRoundedOffAmount(value.toFixed(2));
    return (
      <View style={styles.individualItem}>
        {circleContent ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
            <Text style={[styles.itemText, styles.circleText]}>Circle </Text>
            <Text style={styles.itemText}>{heading}</Text>
          </View>
        ) : (
          <Text style={styles.itemText}>{heading}</Text>
        )}
        <Text style={circleContent ? [styles.itemText, styles.circleText] : styles.itemText}>
          {string.common.Rs}
          {roundedOffValue}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 16 }}>
        {savingsClicked && cartSavings
          ? renderDiscountCashbackValue('Product Discount', cartSavings)
          : null}
        {savingsClicked && deliveryCharges && isDeliveryFree
          ? renderDiscountCashbackValue('Delivery Charges', deliveryCharges)
          : null}
        {savingsClicked && couponSavings
          ? renderDiscountCashbackValue('Coupon Discount', couponSavings)
          : null}
        {cashbackDetails?.circleCashback
          ? renderDiscountCashbackValue(
              'Membership Cashback (HC)',
              cashbackDetails?.circleCashback,
              true
            )
          : circleMembershipCashback
          ? renderDiscountCashbackValue('Membership Cashback (HC)', circleMembershipCashback, true)
          : null}
        {cashbackDetails?.couponCashback
          ? renderDiscountCashbackValue('Coupon Cashback (HC)', cashbackDetails?.couponCashback)
          : couponCashBack
          ? renderDiscountCashbackValue('Coupon Cashback (HC)', couponCashBack)
          : null}
      </View>
      {renderHealthCreditsText()}
      <View style={inStyles.triangle}></View>
      <View style={inStyles.triangle2}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: theme.colors.SHADE_OF_GRAY,
    paddingTop: 14,
    width: 250,
    marginBottom: 7,
    backgroundColor: theme.colors.HEX_WHITE,
  },
  individualItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  itemText: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: theme.colors.LIGHT_BLUE,
  },
  circleText: {
    color: theme.colors.APP_YELLOW,
  },
  textUnderline: {
    color: theme.colors.SHADE_OF_GRAY,
    opacity: 0.3,
  },
  healthCreditContainer: {
    paddingBottom: 8,
    paddingLeft: 16,
    flexWrap: 'wrap',
    flex: 1,
  },
  healthCreditText: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: theme.colors.SHADE_OF_GRAY,
  },
});
