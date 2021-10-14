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
  },

  subPlanOne: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subPlanTwo: {
    flex: 0.4,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  subPlanThree: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
});

export interface CircleTypeCard7Props {
  onButtonPress: () => void;
  price?: string;
  validity?: string;
}

export const CircleTypeCard7: React.FC<CircleTypeCard7Props> = (props) => {
  const { onButtonPress, price, validity } = props;

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
          <Text style={{ ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 0.7, 16) }}>
            Available Health{'\n'}Credits:
            <Text style={{ ...theme.viewStyles.text('M', 15, theme.colors.SHERPA_BLUE, 1, 18) }}>
              {' '}
              {price || 0}
            </Text>
          </Text>
        </View>

        <View style={styles.subPlanThree}>
          <Text
            style={{ height: 32, ...theme.viewStyles.text('B', 15, '#FC9916', 1, 18) }}
            onPress={onButtonPress}
          >
            EXPLORE addeefe
          </Text>
        </View>
      </View>
    </View>
  );
};
