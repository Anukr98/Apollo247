import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import {
  AddPatientCircleIcon,
  ArrowRight,
  CircleLogo,
  MinusPatientCircleIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';

interface CircleCardProps {
  gradiantStyle?: StyleProp<ViewStyle>;
  gradiantColor?: any;
  outerView?: StyleProp<ViewStyle>;
  heading1: string;
  circleSaving: string | number;
  toPayPrice: string | number;
  defaultPlanPrice: string | number;
  defaultPlanMonths: string | number;
  rightText: string;
  effectivePriceText: string;
  upperLeftText: string;
  upperMiddleText: string;
  upperRightText: string;
  isPlanPreselected: boolean;
  onPressViewPlan: () => void;
  onTogglePlans: () => void;
}

const CircleCard: React.FC<CircleCardProps> = (props) => {
  const {
    isPlanPreselected,
    onTogglePlans,
    onPressViewPlan,
    gradiantColor,
    gradiantStyle,
    heading1,
    outerView,
    upperLeftText,
    upperMiddleText,
    upperRightText,
    circleSaving,
    toPayPrice,
    effectivePriceText,
    defaultPlanMonths,
    defaultPlanPrice,
    rightText,
  } = props;
  return (
    <LinearGradientComponent style={gradiantStyle} colors={gradiantColor}>
      <View style={outerView}>
        <Text style={styles.semiBoldHeading}>{heading1}</Text>
        <CircleLogo style={styles.circleIcon} />
      </View>
      <View style={{ marginTop: -4 }}>
        <Text style={styles.mediumText}>
          {upperLeftText}{' '}
          <Text style={styles.mediumGreenText}>
            {upperMiddleText} {string.common.Rs}
            {circleSaving}
          </Text>{' '}
          {upperRightText}{' '}
        </Text>
        <Text style={[styles.mediumText, { marginTop: 2 }]}>
          {effectivePriceText}{' '}
          <Text style={styles.mediumGreenText}>
            {string.common.Rs}
            {toPayPrice}
          </Text>
        </Text>
      </View>
      <View style={styles.belowView}>
        {!!defaultPlanMonths && !!defaultPlanPrice ? (
          <TouchableOpacity
            onPress={onTogglePlans}
            style={[
              styles.leftTouch,
              { backgroundColor: isPlanPreselected ? colors.APP_GREEN : colors.WHITE },
            ]}
          >
            <View style={styles.leftView}>
              <Text
                style={[
                  styles.leftTextPrice,
                  { color: isPlanPreselected ? colors.WHITE : colors.SHERPA_BLUE },
                ]}
              >
                {string.common.Rs}
                {defaultPlanPrice}
                <Text
                  style={[
                    styles.leftTextMonth,
                    { color: isPlanPreselected ? colors.WHITE : colors.SHERPA_BLUE },
                  ]}
                >
                  {' '}
                  for {defaultPlanMonths} months{' '}
                </Text>
              </Text>
              {isPlanPreselected ? (
                <AddPatientCircleIcon style={styles.leftIconStyle} />
              ) : (
                <MinusPatientCircleIcon style={styles.leftIconStyle} />
              )}
            </View>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={onPressViewPlan} style={styles.rightTouch}>
          <Text style={styles.yellowText}>{rightText}</Text>
          <ArrowRight style={styles.rightIconStyle} />
        </TouchableOpacity>
      </View>
    </LinearGradientComponent>
  );
};

export default React.memo(CircleCard);

const styles = StyleSheet.create({
  container: {
    shadowOffset: { width: 0, height: 5 },
    elevation: 15,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  outerView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
  },
  rightTouch: {
    backgroundColor: colors.WHITE,
    borderColor: colors.APP_YELLOW,
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  yellowText: { ...theme.viewStyles.text('B', 12, theme.colors.APP_YELLOW, 1, 14) },
  rightIconStyle: { tintColor: colors.APP_YELLOW, marginLeft: 6 },
  leftIconStyle: { height: 17, width: 17, resizeMode: 'contain', marginLeft: 6 },
  leftTextMonth: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 14),
  },
  leftTextPrice: {
    ...theme.viewStyles.text('B', 14, theme.colors.SHERPA_BLUE, 1, 14),
  },
  leftView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftTouch: {
    backgroundColor: colors.WHITE,
    borderColor: colors.APP_GREEN,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '55%',
  },
  belowView: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  mediumGreenText: { ...theme.viewStyles.text('M', 12, theme.colors.APP_GREEN, 1, 16) },
  mediumText: { ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 16) },
  circleIcon: { height: 47, width: 47, resizeMode: 'contain' },
  semiBoldHeading: { ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 16) },
});

CircleCard.defaultProps = {
  gradiantStyle: styles.container,
  gradiantColor: ['#FFF6DE', '#FFDDD6'],
  outerView: styles.outerView,
};
