import React from 'react';
import { View, StyleSheet, Text, Image, Dimensions } from 'react-native';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  planContainer: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: 5,
  },

  subPlanOne: {
    flex: 0.2,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 5,
  },

  subPlanTwo: {
    flex: 0.2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  subPlanThree: {
    flex: 0.3,
    alignItems: 'flex-start',
  },

  subPlanFour: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
    marginTop: -5,
  },

  alertText: {
    transform: [{ rotate: '-43deg' }],
    ...theme.viewStyles.text('M', 9, '#fff', 1, 11),
    backgroundColor: '#C5411E',
    width: '100%',
    alignSelf: 'center',
    left: -24,
    marginTop: -2,
    paddingLeft: 16,
    paddingTop: 2,
  },
});

export interface CircleTypeCard5Props {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  expired?: string;
  credits?: string;
  renew?: boolean;
}

export const CircleTypeCard5: React.FC<CircleTypeCard5Props> = (props) => {
  const { onButtonPress, expired, credits, renew, savings } = props;
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
              You saved ₹{savings || 'Unable to Load'} with circle
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
