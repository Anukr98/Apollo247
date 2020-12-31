import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
const width = Dimensions.get('window').width;

interface CircleHeadingProps {
  isSubscribed?: boolean;
}

export const CircleHeading: React.FC<CircleHeadingProps> = (props) => {
  return (
    <>
      {props.isSubscribed && (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <CircleLogo style={[styles.circleIconStyle, { marginLeft: -3 }]} />
          <Text style={[styles.circleText, { marginLeft: width > 380 ? -1 : 0 }]}>
            coupon pre applied
          </Text>
        </View>
      )}
      {!props.isSubscribed && (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={[styles.circleText, { marginRight: width > 380 ? 0 : 2 }]}>For</Text>
          <CircleLogo style={styles.circleIconStyle} />
          <Text style={[styles.circleText, { marginLeft: width > 380 ? -3 : 0 }]}>Members</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  circleText: {
    ...theme.viewStyles.text('M', width > 380 ? 10.5 : 10, theme.colors.SHERPA_BLUE),
    lineHeight: 13,
    textAlign: 'center',
    alignSelf: 'center',
  },
  circleIconStyle: {
    height: 20,
    width: width > 380 ? 36 : 32,
    resizeMode: 'contain',
    marginRight: 2,
  },
});
