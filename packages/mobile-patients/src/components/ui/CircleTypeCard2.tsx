import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  planContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    marginVertical: 5,
  },

  subPlanOne: {
    flex: 0.2,
    alignItems: 'center',
  },

  subPlanTwo: {
    flex: 0.4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  subPlanThree: {
    flex: 0.4,
    alignItems: 'center',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
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
              Save upto ₹800 monthly
            </Text>
            <Text
              style={{
                ...theme.viewStyles.text('M', 10, theme.colors.WHITE, 1, 20),
                fontStyle: 'italic',
              }}
            >
              Plan Expired on {expired}
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
