import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

interface CircleTotalBillProps {}
export const CircleTotalBill: React.FC<CircleTotalBillProps> = (props) => {
  const { circlePlanSelected, defaultCirclePlan } = useShoppingCart();
  const planSellingPrice = defaultCirclePlan
    ? defaultCirclePlan?.currentSellingPrice
    : circlePlanSelected?.currentSellingPrice;
  const planDurationInMonth = defaultCirclePlan
    ? defaultCirclePlan?.durationInMonth
    : circlePlanSelected?.durationInMonth;
  return (
    <View style={styles.container}>
      <View style={styles.spaceRow}>
        <Text style={styles.regularText}>{string.circleDoctors.billTotal}</Text>
        <Text style={styles.regularText}>
          {string.common.Rs}
          {planSellingPrice}
        </Text>
      </View>
      <View style={styles.seperator} />
      <View style={styles.row}>
        <CircleLogo style={styles.circleLogo} />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE) }}>
            {string.circleDoctors.membershipPlan}
          </Text>
          <Text style={{ ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE) }}>
            {planDurationInMonth} month
            {`${planDurationInMonth === 1 ? '' : 's'}`} plan
          </Text>
          {/* <Text style={styles.validityText}>Valid till: xxxx</Text> */}
        </View>
      </View>
      <View style={styles.seperatorTwo} />
      <View style={styles.spaceRow}>
        <Text style={styles.mediumText}>{string.circleDoctors.total}</Text>
        <Text style={styles.mediumText}>
          {string.common.Rs}
          {planSellingPrice}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 10,
    backgroundColor: 'white',
    paddingVertical: 11,
    margin: 20,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 11,
  },
  regularText: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHERPA_BLUE),
  },
  seperator: {
    width: '100%',
    marginTop: 10,
    height: 0.5,
    backgroundColor: theme.colors.BORDER_BOTTOM_COLOR,
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 10,
  },
  circleLogo: {
    width: 54,
    height: 34,
  },
  validityText: {
    ...theme.viewStyles.text('R', 12, theme.colors.CARD_SUBTEXT),
    marginVertical: 14,
  },
  seperatorTwo: {
    height: 0.5,
    backgroundColor: theme.colors.BORDER_BOTTOM_COLOR,
    opacity: 0.5,
    marginHorizontal: 11,
  },
  mediumText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE),
    marginTop: 7,
  },
});
