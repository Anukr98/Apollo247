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

        <View style={styles.subPlanTwo}>
          <View>
            <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B', 1, 16) }}>
              Your Plan {'\n'}Expires In:{'  '}
              <Text
                style={[
                  { ...theme.viewStyles.text('M', 20, '#02475B', 1, 25) },
                  { alignSelf: 'flex-end' },
                ]}
              >
                {expiry} {expiry == '1' ? `day` : `days`}
              </Text>
            </Text>
            {credits ? (
              <View style={[styles.planContainer, { justifyContent: 'flex-start' }]}>
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
