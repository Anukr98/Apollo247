import React, { useState, useEffect } from 'react';
import { Animated, Linking, View, Text, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

export interface ScrollableFooterProps {
  children?: React.ReactNode;
  show: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ScrollableFooter: React.FC<ScrollableFooterProps> = (props) => {
  const textMediumStyle = theme.viewStyles.text('M', 14, '#02475b', 1, 22);
  const textBoldStyle = theme.viewStyles.text('B', 14, '#02475b', 1, 22);
  const PhoneNumberTextStyle = theme.viewStyles.text('M', 14, '#fc9916', 1, 22);
  const ontapNumber = (number: string) => {
    Linking.openURL(`tel:${number}`)
      .then(() => {})
      .catch((e) => {
        CommonBugFender('ScrollableFooter_Linking_Call', e);
      });
  };
  const { children, show, containerStyle } = props;
  const [bottomOffset] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(bottomOffset, {
      toValue: show ? 0 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [show]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          ...theme.viewStyles.cardViewStyle,
          left: 0,
          right: 0,
          borderRadius: 0,
          transform: [
            {
              translateY: bottomOffset.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 100],
              }),
            },
          ],
        },
        containerStyle,
      ]}
    >
      {children ? (
        children
      ) : (
        <View style={{ marginHorizontal: 20, marginVertical: 16 }}>
          <Text>
            <Text style={textMediumStyle}>{'For '}</Text>
            <Text style={textBoldStyle}>{'Test Orders,'}</Text>
            <Text style={textMediumStyle}>
              {' to know the Order Status / Reschedule / Cancel, please call — \n'}
            </Text>
            <Text onPress={() => ontapNumber('040 44442424')} style={PhoneNumberTextStyle}>
              {'040 44442424'}
            </Text>
            <Text style={textMediumStyle}>{' / '}</Text>
            <Text onPress={() => ontapNumber('040 33442424')} style={PhoneNumberTextStyle}>
              {'040 33442424'}
            </Text>
          </Text>
        </View>
      )}
    </Animated.View>
  );
};
