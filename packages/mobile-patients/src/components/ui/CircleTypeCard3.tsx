import React from 'react';
import { View, StyleSheet, Text, Image, Dimensions } from 'react-native';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  planContainer: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: 4,
    paddingVertical: 6,
    paddingRight: 6,
    alignItems: 'center',
  },

  subPlanOne: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },

  subPlanTwo: {
    flex: 0.55,
    justifyContent: 'flex-start',
  },

  subPlanThree: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
});

export interface CircleTypeCard3Props {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  credits?: string;
}

export const CircleTypeCard3: React.FC<CircleTypeCard3Props> = (props) => {
  const { onButtonPress, savings, credits } = props;

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
            You saved ₹{savings || '--'} with
          </Text>
          <Text style={{ ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE, 1, 20) }}>
            Circle Membership
          </Text>
        </View>

        <View style={styles.subPlanThree}>
          <Text
            style={{ ...theme.viewStyles.text('B', 15, '#FC9916', 1, 20) }}
            onPress={onButtonPress}
          >
            EXPLORE
          </Text>
        </View>
      </View>
    </View>
  );
};
