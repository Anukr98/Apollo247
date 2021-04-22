import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  planContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },

  subPlanOne: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subPlanTwo: {
    flex: 0.3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  subPlanThree: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
});

export interface CircleTypeCard4Props extends NavigationScreenProps {
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
            source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.png')}
          />
        </View>

        <View style={styles.subPlanTwo}>
          <Text style={{ ...theme.viewStyles.text('M', 12, '#666666', 0.6, 16) }}>
            Available Health{'\n'}Credits:
            <Text style={{ ...theme.viewStyles.text('M', 15, '#000', 1, 18) }}>
              {' '}
              {credits || 0}
            </Text>
          </Text>
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
