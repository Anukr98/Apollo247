import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

interface CircleTotalBillProps {
  selectedPlan?: any;
}
export const CircleTotalBill: React.FC<CircleTotalBillProps> = (props) => {
  const { selectedPlan } = props;
  const { circlePlanSelected, defaultCirclePlan, subscriptionCoupon } = useShoppingCart();
  const planSellingPrice = selectedPlan
    ? selectedPlan?.currentSellingPrice
    : defaultCirclePlan
    ? defaultCirclePlan?.currentSellingPrice
    : circlePlanSelected?.currentSellingPrice;
  const planDurationInMonth = selectedPlan
    ? selectedPlan?.durationInMonth
    : defaultCirclePlan
    ? defaultCirclePlan?.durationInMonth
    : circlePlanSelected?.durationInMonth;
  const totalPlanSellingPrice = subscriptionCoupon?.discount
    ? planSellingPrice - Number(subscriptionCoupon?.discount)
    : planSellingPrice;
  return (
    <View style={styles.container}>
      <View style={styles.spaceRow}>
        <Text style={styles.regularText}>{string.circleDoctors.billTotal}</Text>
        <Text style={styles.regularText}>
          {string.common.Rs}
          {convertNumberToDecimal(planSellingPrice)}
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
        </View>
      </View>
      <View style={styles.seperatorTwo} />
      <View style={{ paddingVertical: 6 }}>
        <View style={styles.spaceRow}>
          <Text style={styles.regularText}>{`MRP Total`}</Text>
          <Text style={styles.regularText}>
            {string.common.Rs}
            {convertNumberToDecimal(planSellingPrice)}
          </Text>
        </View>
        {!!subscriptionCoupon && (
          <View style={[styles.spaceRow, { paddingTop: 6 }]}>
            <Text
              style={[styles.regularText, { color: '#0087BA' }]}
            >{`Discount(${subscriptionCoupon?.coupon})`}</Text>
            <Text style={[styles.regularText, { color: '#0087BA' }]}>
              {`- ${string.common.Rs}`}
              {subscriptionCoupon?.discount}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.seperatorTwo} />
      <View style={styles.spaceRow}>
        <Text style={styles.mediumText}>{string.circleDoctors.total}</Text>
        <Text style={styles.mediumText}>
          {string.common.Rs}
          {totalPlanSellingPrice}
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
    marginVertical: 20,
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
