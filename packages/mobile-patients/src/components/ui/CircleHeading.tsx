import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface CircleHeadingProps {
  isSubscribed?: boolean;
}

export const CircleHeading: React.FC<CircleHeadingProps> = (props) => {
  return (
    <>
      {props.isSubscribed && (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <CircleLogo style={[styles.circleIconStyle, { marginLeft: -3 }]} />
          <Text style={[styles.circleText, { marginLeft: isSmallDevice ? 0 : -1 }]}>
            coupon pre applied
          </Text>
        </View>
      )}
      {!props.isSubscribed && (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={[styles.circleText, { marginRight: isSmallDevice ? 2 : 1 }]}>For</Text>
          <CircleLogo style={styles.circleIconStyle} />
          <Text style={[styles.circleText, { marginLeft: isSmallDevice ? 0 : -3 }]}>Members</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  circleText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 9.5 : 10.5, theme.colors.SHERPA_BLUE),
    lineHeight: 13,
    textAlign: 'center',
    alignSelf: 'center',
  },
  circleIconStyle: {
    height: isSmallDevice ? 16 : 19,
    width: isSmallDevice ? 27 : 35,
    resizeMode: 'contain',
    marginRight: 2,
  },
});
