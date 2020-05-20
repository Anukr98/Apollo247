import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface QuantityButtonProps {
  style?: StyleProp<ViewStyle>;
  text: '-' | '+';
  onPress: () => void;
}

export const QuantityButton: React.FC<QuantityButtonProps> = (props) => {
  return (
    <TouchableOpacity activeOpacity={1} onPress={props.onPress}>
      <View
        style={[
          {
            width: 18,
            height: 18,
            margin: 16,
            marginRight: props.text == '+' ? 0 : 16,
            borderWidth: 1,
            borderColor: '#fc9916',
            justifyContent: 'center',
            alignItems: 'center',
          },
          props.style,
        ]}
      >
        <Text
          style={{
            ...theme.viewStyles.text('SB', 14, '#fc9916', 1, 24, 0),
            marginTop: -4,
          }}
        >
          {props.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
