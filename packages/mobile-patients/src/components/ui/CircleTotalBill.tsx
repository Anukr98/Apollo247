import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

interface CircleTotalBillProps {
  selectedPlan?: any;
  from?: string;
}
export const CircleTotalBill: React.FC<CircleTotalBillProps> = (props) => {
  const { selectedPlan, from } = props;
  const isFromPayment = from;
  const {
    circlePlanSelected,
    defaultCirclePlan,
    subscriptionCoupon,
    subscriptionHCUsed,
  } = useShoppingCart();
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

  const renderBillTotal = () => (
    <View style={styles.spaceRow}>
      <Text style={styles.regularText}>{string.circleDoctors.billTotal}</Text>
      {!isFromPayment && (
        <Text style={styles.regularText}>
          {string.common.Rs}
          {convertNumberToDecimal(planSellingPrice)}
        </Text>
      )}
    </View>
  );

  const renderCirclePlanAdded = () => (
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
  );

  const renderBillDetails = () => {
    const circleTitle = `(${planDurationInMonth} month${planDurationInMonth === 1 ? '' : 's'})`;
    return (
      <View style={{ paddingVertical: 6 }}>
        <View style={styles.spaceRow}>
          <Text style={styles.regularText}>
            {isFromPayment ? `Circle Membership ${circleTitle}` : `MRP Total`}
          </Text>
          <Text style={styles.regularText}>
            {string.common.Rs}
            {convertNumberToDecimal(planSellingPrice)}
          </Text>
        </View>
        {!!subscriptionCoupon && !isFromPayment && (
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
        {!!subscriptionCoupon && isFromPayment && (
          <View style={[styles.spaceRow, { paddingTop: 6 }]}>
            <View>
              <Text style={styles.regularText}>{`Coupon Applied`}</Text>
              <Text style={styles.regularText}>{`(${subscriptionCoupon?.coupon})`}</Text>
            </View>
            <Text style={styles.regularText}>
              {`- ${string.common.Rs}`}
              {subscriptionCoupon?.discount}
            </Text>
          </View>
        )}
        {isFromPayment && !!subscriptionHCUsed && (
          <View style={[styles.spaceRow, { paddingTop: 6 }]}>
            <Text style={[styles.regularText]}>{`OneApollo HC`}</Text>
            <Text style={[styles.regularText]}>
              {`- ${string.common.Rs}`}
              {subscriptionHCUsed}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderTotalBill = () => {
    const discount = Number(subscriptionCoupon?.discount) || 0;
    return (
      <View style={styles.spaceRow}>
        <Text style={styles.mediumText}>{string.circleDoctors.total}</Text>
        <Text style={styles.mediumText}>
          {string.common.Rs}
          {planSellingPrice - discount - subscriptionHCUsed}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBillTotal()}
      <View style={styles.seperator} />
      {!isFromPayment && (
        <>
          {renderCirclePlanAdded()}
          <View style={styles.seperatorTwo} />
        </>
      )}
      {renderBillDetails()}
      <View style={styles.seperatorTwo} />
      {renderTotalBill()}
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
