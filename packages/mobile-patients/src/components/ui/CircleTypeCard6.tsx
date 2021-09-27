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
    overflow: 'hidden',
    backgroundColor: 'transparent',
    padding: 5,
  },

  subPlanTwo: {
    flex: 0.5,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  subPlanThree: {
    flex: 0.3,
    alignItems: 'flex-start',
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

export interface CircleTypeCard6Props extends NavigationScreenProps {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  expired?: string;
  credits?: string;
  renew?: boolean;
}

export const CircleTypeCard6: React.FC<CircleTypeCard6Props> = (props) => {
  const { onButtonPress, expired, credits, renew } = props;
  return (
    <View>
      <View style={styles.planContainer}>
        <View style={styles.subPlanOne}>
          <Text style={styles.alertText}>Expired</Text>

          <Image
            style={styles.circleLogo}
            source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.webp')}
          />
        </View>

        <View style={styles.subPlanTwo}>
          <Text style={{ ...theme.viewStyles.text('M', 12, '#666666', 1, 16) }}>
            Plan Expired on:
          </Text>
          <Text style={{ ...theme.viewStyles.text('M', 20, '#666666', 1, 25) }}>{expired}</Text>
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

        {renew ? <View
          style={[
            styles.subPlanThree,
            {
              marginTop: credits ? -20 : 0,
            },
          ]}
        >
          <Button
            title={`RENEW NOW`}
            style={{ width: 106, height: 32 }}
            onPress={onButtonPress}
            disabled={false}
          />
        </View>
        : null}
      </View>
    </View>
  );
};
