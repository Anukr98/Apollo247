import React from 'react';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
const windowWidth = Dimensions.get('window').width;

export interface CirclePurchaseProps {
  subscriptionInfo: any;
  onPressBenefits: () => void;
  circleSavings: any;
}

export const CirclePurchase: React.FC<CirclePurchaseProps> = (props) => {
  const { subscriptionInfo, onPressBenefits, circleSavings } = props;
  const amount = subscriptionInfo?.payment_reference?.amount_paid;
  const endDate = subscriptionInfo?.end_date;

  const renderSavings = () => {
    return !!circleSavings ? (
      <Text style={styles.savings}>
        You <Text style={styles.savingsAmt}>saved ₹{circleSavings}</Text> on your purchase
      </Text>
    ) : null;
  };

  const renderValidity = () => {
    return <Text style={styles.validity}>{`Valid till: ${new Date(endDate).toDateString()}`}</Text>;
  };

  const renderViewDetails = () => {
    return (
      <TouchableOpacity onPress={onPressBenefits}>
        <Text style={styles.benefits}>VIEW ALL BENEFITS</Text>
      </TouchableOpacity>
    );
  };
  const renderCirclePurchaseInfo = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <CircleLogo style={styles.circleIcon} />
        <View>
          <Text style={styles.message}>
            {`Congrats! You have successfully purchased the 2 months (Trial) Circle Plan for ₹${amount}`}
          </Text>
          {renderSavings()}
          {renderValidity()}
          {renderViewDetails()}
        </View>
      </View>
    );
  };

  return !!subscriptionInfo ? (
    <View style={styles.container}>{renderCirclePurchaseInfo()}</View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  circleIcon: {
    width: 42,
    height: 23,
    marginRight: 10,
  },
  message: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 14,
    color: '#02475B',
    flexWrap: 'wrap',
    width: windowWidth - 108,
  },
  savings: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: '#01475B',
    marginTop: 5,
  },
  savingsAmt: {
    color: '#00B38E',
  },
  savingsBlast: {
    height: 20,
    width: 20,
  },
  validity: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    color: '#979797',
    marginTop: 10,
  },
  benefits: {
    textAlign: 'right',
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FC9916',
    marginTop: 5,
    marginRight: 4,
  },
});
