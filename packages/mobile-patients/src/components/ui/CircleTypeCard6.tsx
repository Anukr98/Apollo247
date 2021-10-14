import React from 'react';
import { View, StyleSheet, Text, Image, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { Savings } from '../MedicineCart/Components/Savings';
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
  subPlanTwoThreeDevider: {
    flex: 0.8,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#F9D5B4',
    padding: 6,
    alignItems: 'center',
  },
});

export interface CircleTypeCard6Props {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  expired?: string;
  credits?: string;
  renew?: boolean;
}

export const CircleTypeCard6: React.FC<CircleTypeCard6Props> = (props) => {
  const { onButtonPress, expired, credits, renew, expiry } = props;
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
          colors={['#FFEEDB', '#FFFCFA']}
        >
          <View style={styles.subPlanTwo}>
            <Text style={{ ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 1, 20) }}>
              Free Deliveries and Cashbacks
            </Text>
            <Text
              style={{
                ...theme.viewStyles.text('M', 10, theme.colors.LIGHT_BLUE, 1, 20),
                fontStyle: 'italic',
              }}
            >
              Buy Circle @ ₹{Savings || 'Unable to Load'} for {expired + '-' + expiry} months
            </Text>
          </View>

          <View style={styles.subPlanThree}>
            <Text
              style={{ ...theme.viewStyles.text('B', 15, '#FC9916', 1, 18) }}
              onPress={onButtonPress}
            >
              BUY NOW
            </Text>
          </View>
        </LinearGradientComponent>
      </View>
    </View>
  );
};
