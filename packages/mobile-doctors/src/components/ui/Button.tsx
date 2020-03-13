import React from 'react';
import {
  StyleProp,
  Text,
  TouchableOpacity,
  ViewStyle,
  TouchableOpacityProps,
  TextStyle,
  View,
} from 'react-native';
import { theme } from '../../theme/theme';
import ButtonStyles from '@aph/mobile-doctors/src/components/ui/Button.styles';

const styles = ButtonStyles;
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
