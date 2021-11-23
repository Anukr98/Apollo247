import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';

const styles = StyleSheet.create({
  planContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  subPlanOne: {
    flex: 0.2,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  subPlanTwo: {
    flex: 0.7,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  subPlanThree: {
    flex: 0.3,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
  subPlanTwoThreeDevider: {
    flex: 0.8,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#4D9CB3',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

export interface CircleTypeCard2Props {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  credits?: string;
}

export const CircleTypeCard2: React.FC<CircleTypeCard2Props> = (props) => {
  const { onButtonPress, savings, expiry, credits } = props;

  return (
    <View>
      <View style={styles.planContainer}>
        <View style={styles.subPlanOne}>
          <Image
            style={styles.circleLogo}
            source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.webp')}
          />
        </View>
        <LinearGradientComponent
          style={styles.subPlanTwoThreeDevider}
          colors={[theme.colors.LIGHT_BLUE, theme.colors.LIGHT_BLUE]}
        >
          <View style={styles.subPlanTwo}>
            <Text style={{ ...theme.viewStyles.text('M', 13, theme.colors.WHITE, 1, 20) }}>
              Don’t Lose on Free Deliveries
            </Text>
            <Text style={{ ...theme.viewStyles.text('M', 13, theme.colors.WHITE, 1, 20) }}>
              & Cashbacks
            </Text>
          </View>

          <View style={styles.subPlanThree}>
            <Text
              style={{ ...theme.viewStyles.text('B', 15, '#FC9916', 1, 18) }}
              onPress={onButtonPress}
            >
              RENEW
            </Text>
          </View>
        </LinearGradientComponent>
      </View>
    </View>
  );
};
