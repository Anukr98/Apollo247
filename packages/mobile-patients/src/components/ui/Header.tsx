import {
  BackArrow,
  BackArrowWhite,
  Remove,
  HomeIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
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
import { ApolloLogo } from '../ApolloLogo';

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
  style?: StyleProp<TextStyle>;
  isBack?: boolean;
  title?: string;
  onPress?: TextProps['onPress'];
};

export interface HeaderProps {
  leftText?: leftText;
  rightText?: rightText;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  titleComponent?: React.ReactNode;
  leftIcon?: 'backArrow' | 'close' | 'backArrowWhite' | 'logo' | 'homeIcon';
  rightIcon?: string;
  rightComponent?: React.ReactNode;
  container?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps['onPress'];
  onPressLeftIcon?: TouchableOpacityProps['onPress'];
  titleTextProps?: TextProps;
  titleTextViewStyle?: ViewStyle;
  leftComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = (props) => {
  const {
    titleComponent,
    rightText,
    title,
    leftIcon,
    rightIcon,
    titleTextProps,
    titleTextViewStyle,
  } = props;

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
            {leftIcon === 'homeIcon' && <HomeIcon />}
            {leftIcon === 'logo' && (
              <ApolloLogo style={{ width: 57, height: 37 }} resizeMode="contain" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {props.leftComponent ? props.leftComponent : null}
      <View style={[{ flexGrow: 1 }, titleTextViewStyle]}>
        {titleComponent ? titleComponent : null}
        {title && (
          <Text
            style={[styles.titleTextStyle, props.titleStyle]}
            numberOfLines={1}
            {...titleTextProps}
          >
            {title}
          </Text>
        )}
      </View>
      <View style={{ flexGrow: 1, alignItems: 'flex-end' }}>
        {rightText && (
          <Text style={[styles.rightTextStyle, rightText.style]} onPress={rightText.onPress}>
            {rightText.title}
          </Text>
        )}
        {rightIcon && rightIcon}
        {props.rightComponent ? props.rightComponent : null}
      </View>
    </View>
  );
};
