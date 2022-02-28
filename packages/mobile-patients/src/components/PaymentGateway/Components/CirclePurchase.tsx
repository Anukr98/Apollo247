import React from 'react';
import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
const windowWidth = Dimensions.get('window').width;

export interface CirclePurchaseProps {
  subscriptionInfo: any;
  onPressBenefits: () => void;
  circleSavings: any;
  containerStyle?: StyleProp<ViewStyle>;
  circleLogoIcon?: StyleProp<ImageStyle>;
  textContainerStyle?: StyleProp<ViewStyle>;
}

export const CirclePurchase: React.FC<CirclePurchaseProps> = (props) => {
  const { subscriptionInfo, onPressBenefits, circleSavings } = props;
  const amount = subscriptionInfo?.payment_reference?.purchase_via_HC
    ? subscriptionInfo?.payment_reference?.HC_used +
      subscriptionInfo?.payment_reference?.amount_paid
    : subscriptionInfo?.payment_reference?.amount_paid;
  const findPlan = subscriptionInfo?.group_plan?.plan_summary?.find(
    (plan: any) => plan?.subPlanId === subscriptionInfo?.sub_plan_id
  );
  const endDate = subscriptionInfo?.end_date;
  const duration = !!findPlan
    ? findPlan?.durationInMonth
    : subscriptionInfo?.group_plan?.valid_duration;

  const renderSavings = () => {
    return !!circleSavings ? (
      <Text style={styles.savings}>
        You{' '}
        <Text style={styles.savingsAmt}>
          saved {string.common.Rs}
          {circleSavings?.toFixed(2)}
        </Text>{' '}
        on your purchase
      </Text>
    ) : null;
  };

  const renderValidity = () => {
    return (
      <Text style={styles.validity}>{`Valid till: ${new Date(endDate)?.toDateString()}`}</Text>
    );
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
        <CircleLogo style={!!props.circleLogoIcon ? props.circleLogoIcon : styles.circleIcon} />
        <View style={!!props.textContainerStyle && props.textContainerStyle}>
          <Text style={styles.message}>
            {`Congrats! You have successfully purchased the ${duration} months (Trial) Circle Plan for ${string.common.Rs}${amount}`}
          </Text>
          {renderSavings()}
          {renderValidity()}
          {renderViewDetails()}
        </View>
      </View>
    );
  };

  return !!subscriptionInfo ? (
    <View style={!!props.containerStyle ? props.containerStyle : styles.container}>
      {renderCirclePurchaseInfo()}
    </View>
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
    padding: 16,
    borderLeftColor: '#007C9D',
    borderLeftWidth: 4,
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
    color: colors.SHERPA_BLUE,
    marginTop: 8,
    fontWeight: '600',
  },
  savingsAmt: {
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansSemiBold(12),
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
