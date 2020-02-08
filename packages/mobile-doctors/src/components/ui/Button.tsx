import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TouchableOpacityProps,
  TextStyle,
  View,
} from 'react-native';
import { theme } from '../../theme/theme';

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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledStyle: {
    backgroundColor: theme.colors.BUTTON_DISABLED_BG,
  },
  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_TEXT,
    textAlign: 'center',
  },
});

export interface ButtonProps {
  style?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  title?: string;
  onPress?: TouchableOpacityProps['onPress'];
  disabled?: boolean;
  variant?: 'white' | 'orange' | 'green';
  buttonIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = (props) => {
  return (
    <TouchableOpacity
      style={[
        styles.containerStyles,
        props.variant == 'white'
          ? { backgroundColor: theme.colors.WHITE }
          : props.variant == 'green'
          ? { backgroundColor: theme.colors.APP_GREEN }
          : {},
        props.style,
        props.disabled ? styles.disabledStyle : null,
      ]}
      onPress={props.disabled ? () => {} : props.onPress}
      activeOpacity={props.disabled ? 1 : 0.6}
    >
      <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
        <View>{props.buttonIcon}</View>
        <Text
          style={[
            styles.titleTextStyle,
            props.variant == 'white'
              ? { color: theme.colors.BUTTON_BG }
              : props.variant == 'green'
              ? { backgroundColor: theme.colors.APP_GREEN }
              : {},
            props.titleTextStyle,
          ]}
        >
          {props.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
