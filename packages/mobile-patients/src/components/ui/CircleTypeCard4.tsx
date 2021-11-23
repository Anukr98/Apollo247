import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
  planContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
    paddingVertical: 6,
    paddingRight: 12,
  },

  subPlanOne: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subPlanTwo: {
    flex: 0.6,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  subPlanThree: {
    flex: 0.2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
});

export interface CircleTypeCard4Props {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  credits?: string;
}

export const CircleTypeCard4: React.FC<CircleTypeCard4Props> = (props) => {
  const { onButtonPress, credits } = props;

  return (
    <View>
      <View style={styles.planContainer}>
        <View style={styles.subPlanOne}>
          <Image
            style={styles.circleLogo}
            source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.webp')}
          />
        </View>

        <View style={styles.subPlanTwo}>
          <Text style={{ ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE, 1, 20) }}>
            Don’t Lose on Free
          </Text>
          <Text style={{ ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE, 1, 20) }}>
            Deliveries & Cashbacks
          </Text>
        </View>

        <View style={styles.subPlanThree}>
          <Text
            style={{ height: 32, ...theme.viewStyles.text('B', 15, '#FC9916', 1, 18) }}
            onPress={onButtonPress}
          >
            EXPLORE
          </Text>
        </View>
      </View>
    </View>
  );
};
