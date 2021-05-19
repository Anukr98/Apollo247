import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  View,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  containerStyles: {
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.BUTTON_BG,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  disabledStyle: {
    backgroundColor: theme.colors.BUTTON_DISABLED_BG,
  },
  titleTextStyle: {
    ...theme.viewStyles.text('B', isIphone5s() ? 12 : 14, theme.colors.BUTTON_TEXT),
    textAlign: 'center',
  },
  thornStyle: {
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    height: 10,
    width: 10,
    position: 'absolute',
    top: -4,
    borderRadius: 0,
  },
});

export interface ButtonProps {
  style?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  title?: string | React.ReactNode;
  onPress?: TouchableOpacityProps['onPress'];
  disabled?: boolean;
  disabledStyle?: StyleProp<ViewStyle>;
  displayThorn?: boolean;
  thornStyle?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = (props) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.containerStyles,
        props.style,
        props.disabled ? [styles.disabledStyle, props.disabledStyle] : null,
      ]}
      onPress={props.disabled ? () => {} : props.onPress}
    >
      {props.displayThorn && <View style={[styles.thornStyle, props.thornStyle]} />}
      <Text style={[styles.titleTextStyle, props.titleTextStyle]}>{props.title}</Text>
    </TouchableOpacity>
  );
};
