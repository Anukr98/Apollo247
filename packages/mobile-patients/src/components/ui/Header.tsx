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
} from 'react-native';
import { theme } from '../../theme/theme';

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
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.5,
  },
});

type leftText = {
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
  leftIcon?: string;
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
      <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
        <TouchableOpacity onPress={props.onPressLeftIcon} style={{}}>
          {leftIcon === 'backArrow' && <BackArrow />}
          {leftIcon === 'close' && <Remove />}
          {leftIcon === 'backArrowWhite' && <BackArrowWhite />}
        </TouchableOpacity>
      </View>
      <View>{title && <Text style={styles.titleTextStyle}>{title}</Text>}</View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {rightText && (
          <Text style={styles.rightTextStyle} onPress={rightText.onPress}>
            {rightText.title}
          </Text>
        )}
        {rightIcon && rightIcon}
        {props.rightComponent && props.rightComponent()}
      </View>
    </View>
  );
};
