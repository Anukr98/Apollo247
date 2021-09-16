import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
  containerStyles: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: theme.colors.CAPSULE_ACTIVE_BG,
  },
  disabledStyle: {
    backgroundColor: theme.colors.CAPSULE_INACTIVE_BG,
  },
  titleTextStyle: {
    color: theme.colors.CAPSULE_ACTIVE_TEXT,
    textAlign: 'center',
    ...theme.fonts.IBMPlexSansBold(9),
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  disabledTextStyle: {
    color: theme.colors.SKY_BLUE,
  },
});

export interface CapsuleViewProps {
  style?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  title?: string;
  onPress?: TouchableOpacityProps['onPress'];
  isActive?: boolean;
  upperCase?: boolean;
}

export const CapsuleView: React.FC<CapsuleViewProps> = (props) => {
  if (props.title)
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.containerStyles, props.style, !props.isActive ? styles.disabledStyle : null]}
      >
        <Text
          style={[
            styles.titleTextStyle,
            !props.isActive ? styles.disabledTextStyle : null,
            props.titleTextStyle,
            props.upperCase ? { textTransform: 'uppercase' } : {},
          ]}
        >
          {props.title}
        </Text>
      </TouchableOpacity>
    );
  return null;
};

CapsuleView.defaultProps = {
  isActive: true,
  upperCase: false,
};
