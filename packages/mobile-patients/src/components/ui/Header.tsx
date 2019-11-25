import { BackArrow, BackArrowWhite, Remove } from '@aph/mobile-patients/src/components/ui/Icons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const textStyle = {
  color: theme.colors.SHERPA_BLUE,
  ...theme.fonts.IBMPlexSansSemiBold(13),
  letterSpacing: 0.5,
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderColor: '#ddd',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  rightTextStyle: {
    ...textStyle,
    paddingRight: 14,
  },
  titleTextStyle: {
    textAlign: 'center',
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.5,
  },
});

type leftText = {
  style?: StyleProp<TextStyle>;
  isBack?: boolean;
  title?: string;
  onPress?: TextProps['onPress'];
};

type rightText = {
  isBack?: boolean;
  title?: string;
  onPress?: TextProps['onPress'];
};

export interface HeaderProps {
  leftText?: leftText;
  rightText?: rightText;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  leftIcon?: 'backArrow' | 'close' | 'backArrowWhite';
  rightIcon?: string;
  rightComponent?: React.ReactNode;
  container?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps['onPress'];
  onPressLeftIcon?: TouchableOpacityProps['onPress'];
}

export const Header: React.FC<HeaderProps> = (props) => {
  const { rightText, title, leftIcon, rightIcon } = props;

  return (
    <View style={[styles.container, props.container]}>
      <View style={{ flexGrow: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
        {props.leftText ? (
          <TouchableOpacity activeOpacity={1} onPress={props.leftText.onPress} style={{}}>
            <Text style={styles.titleTextStyle} numberOfLines={1}>
              {props.leftText.title}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={1}
            onPress={props.onPressLeftIcon}
            style={{
              height: 35,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {leftIcon === 'backArrow' && <BackArrow />}
            {leftIcon === 'close' && <Remove />}
            {leftIcon === 'backArrowWhite' && <BackArrowWhite />}
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexGrow: 1 }}>
        {title && (
          <Text style={[styles.titleTextStyle, props.titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      <View style={{ flexGrow: 1, alignItems: 'flex-end' }}>
        {rightText && (
          <Text style={styles.rightTextStyle} onPress={rightText.onPress}>
            {rightText.title}
          </Text>
        )}
        {rightIcon && rightIcon}
        {props.rightComponent ? props.rightComponent : null}
      </View>
    </View>
  );
};
