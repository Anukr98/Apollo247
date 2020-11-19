import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';

interface CircleHeadingProps {
  isSubscribed?: boolean;
}

export const CircleHeading: React.FC<CircleHeadingProps> = (props) => {
  return (
    <>
      {props.isSubscribed && (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <CircleLogo style={[styles.circleIconStyle, { marginLeft: -3 }]} />
          <Text style={[styles.circleText, { marginLeft: -3 }]}>Coupon pre applied</Text>
        </View>
      )}
      {!props.isSubscribed && (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={styles.circleText}>For</Text>
          <CircleLogo style={styles.circleIconStyle} />
          <Text style={[styles.circleText, { marginLeft: -3 }]}>Members</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  circleText: {
    ...theme.viewStyles.text('M', 10.5, theme.colors.SHERPA_BLUE),
    lineHeight: 13,
    textAlign: 'center',
    alignSelf: 'center',
  },
  circleIconStyle: { height: 20, width: 36, resizeMode: 'contain' },
});
