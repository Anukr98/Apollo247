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
    flex: 0.2,
  },
  subPlanThree: {
    flex: 0.3,
  },
  subPlanFour: {
    flex: 0.3,
  },
  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
});

export interface CircleTypeCard1Props {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  credits?: string;
}

export const CircleTypeCard1: React.FC<CircleTypeCard1Props> = (props) => {
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

        <View style={styles.subPlanTwo}>
          <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B', 1, 16) }}>Savings:</Text>
          <Text style={{ ...theme.viewStyles.text('M', 20, '#02475B', 1, 25) }}>₹{savings}</Text>
          <View style={{ width: width }}>
            {credits ? (
              <View style={styles.planContainer}>
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
        </View>

        <View style={styles.subPlanThree}>
          <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B', 1, 16) }}>
            Plan Expires In:
          </Text>
          <Text style={{ ...theme.viewStyles.text('M', 20, '#02475B', 1, 25) }}>
            {expiry} {expiry == '1' ? `day` : `days`}
          </Text>
        </View>

        <View style={styles.subPlanFour}>
          <Text
            style={{ width: 155, height: 32, ...theme.viewStyles.text('B', 15, '#FC9916', 1, 18) }}
            onPress={onButtonPress}
          >
            RENEW NOW
          </Text>
        </View>
      </View>
    </View>
  );
};
