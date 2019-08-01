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
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyles: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
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
    color: theme.colors.CAPSULE_INACTIVE_TEXT,
  },
});

export interface CapsuleViewProps {
  style?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  title?: string;
  onPress?: TouchableOpacityProps['onPress'];
  isActive?: boolean;
}

export const CapsuleView: React.FC<CapsuleViewProps> = (props) => {
  return (
    <TouchableOpacity
      style={[styles.containerStyles, props.style, !props.isActive ? styles.disabledStyle : null]}
      // onPress={props.isActive ? () => {} : props.onPress}
      // activeOpacity={props.isActive ? 1 : 0.6}
    >
      <Text
        style={[
          styles.titleTextStyle,
          !props.isActive ? styles.disabledTextStyle : null,
          props.titleTextStyle,
        ]}
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

CapsuleView.defaultProps = {
  isActive: true,
};
