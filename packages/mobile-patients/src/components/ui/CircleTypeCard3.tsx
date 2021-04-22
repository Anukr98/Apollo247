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
    marginVertical: 5,
  },

  subPlanOne: {
    flex: 0.2,
  },

  subPlanTwo: {
    flex: 0.3,
  },

  subPlanThree: {
    flex: 0.5,
    alignItems: 'center',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
});

export interface CircleTypeCard3Props extends NavigationScreenProps {
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
            source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.png')}
          />
        </View>

        <View style={styles.subPlanTwo}>
          <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B', 1, 16) }}>Your Savings:</Text>
          <Text style={{ ...theme.viewStyles.text('M', 20, '#02475B', 1, 25) }}>₹{savings}</Text>
          {credits ? (
            <View style={[styles.planContainer, { width: width }]}>
              <Text style={{ ...theme.viewStyles.text('M', 12, '#666666', 0.6, 16) }}>
                Available Health Credits:
              </Text>
              <Text style={{ ...theme.viewStyles.text('M', 12, '#666666', 1, 16) }}>
                {' '}
                {credits || 0}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.subPlanThree}>
          <Button
            title={`EXPLORE BENEFITS`}
            style={{ width: 155, height: 32 }}
            onPress={onButtonPress}
            disabled={false}
          />
        </View>
      </View>
    </View>
  );
};
