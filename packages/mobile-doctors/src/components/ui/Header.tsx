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
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { BackArrow, Remove } from '@aph/mobile-doctors/src/components/ui/Icons';

const textStyle = {
  color: theme.colors.SHARP_BLUE,
  ...theme.fonts.IBMPlexSansSemiBold(13),
  letterSpacing: 0.5,
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    // borderColor: '#ddd',
    // borderBottomWidth: 1,
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
    color: theme.colors.SHARP_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
export type HeaderIconProps = {
  icon: Element;
  onPress?: TouchableOpacityProps['onPress'];
};

export interface HeaderProps {
  leftText?: leftText;
  rightText?: rightText;
  headerText?: string;
  titleStyle?: StyleProp<TextStyle>;
  titleComponent?: React.ReactNode;
  leftIcon?: 'backArrow' | 'close' | 'backArrowWhite';
  rightIcon?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps['onPress'];
  onPressLeftIcon?: TouchableOpacityProps['onPress'];
  titleTextProps?: TextProps;
  titleTextViewStyle?: ViewStyle;
  leftIcons?: HeaderIconProps[];
  rightIcons?: HeaderIconProps[];
  iconMarginRight?: number;
}

export const Header: React.FC<HeaderProps> = (props) => {
  const {
    titleComponent,
    rightText,
    headerText,
    leftIcon,
    rightIcon,
    titleTextProps,
    titleTextViewStyle,
    rightIcons,
    leftIcons,
    iconMarginRight,
  } = props;

  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={{ flexGrow: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
        {props.leftText ? (
          <TouchableOpacity activeOpacity={1} onPress={props.leftText.onPress} style={{}}>
            <Text style={styles.titleTextStyle} numberOfLines={1}>
              {props.leftText.title}
            </Text>
          </TouchableOpacity>
        ) : leftIcons ? (
          <View style={styles.iconContainer}>
            {leftIcons.map((icon, i) => (
              <TouchableOpacity
                onPress={icon.onPress}
                key={i}
                style={{
                  marginRight: i !== leftIcons.length - 1 ? iconMarginRight || 12 : 0,
                }}
              >
                {icon.icon}
              </TouchableOpacity>
            ))}
          </View>
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
            {leftIcon === 'close' && <Remove style={{ height: 24, width: 24 }} />}

            {/* {leftIcon === 'backArrowWhite' && <BackArrowWhite />} */}
          </TouchableOpacity>
        )}

        {props.leftComponent ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {props.leftComponent}
          </View>
        ) : null}
      </View>
      <View style={[{ flexGrow: 1 }, titleTextViewStyle]}>
        {titleComponent ? titleComponent : null}
        {headerText && (
          <Text
            style={[styles.titleTextStyle, props.titleStyle]}
            numberOfLines={1}
            {...titleTextProps}
          >
            {headerText}
          </Text>
        )}
      </View>
      <View style={{ flexGrow: 1, alignItems: 'flex-end' }}>
        {rightText && (
          <Text style={styles.rightTextStyle} onPress={rightText.onPress}>
            {rightText.title}
          </Text>
        )}
        {rightIcons && (
          <View style={styles.iconContainer}>
            {rightIcons.map((icon, i) => (
              <TouchableOpacity
                onPress={icon.onPress}
                key={i}
                style={{
                  marginRight: i !== rightIcons.length - 1 ? iconMarginRight || 20 : 0,
                }}
              >
                {icon.icon}
              </TouchableOpacity>
            ))}
          </View>
        )}
        {rightIcon && rightIcon}
        {props.rightComponent ? props.rightComponent : null}
      </View>
    </View>
  );
};
