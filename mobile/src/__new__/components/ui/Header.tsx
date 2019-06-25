import React from 'react';
import {
  View,
  Image,
  Text,
  ImageSourcePropType,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppImages } from '../../images/AppImages';
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
  leftTextStyle: {
    ...textStyle,
    paddingLeft: 6.5,
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
  isBack: boolean;
  title: string;
  onPress: () => void;
};

type rightText = {
  isBack: boolean;
  title: string;
  onPress: () => void;
};

export interface headerProps extends NavigationScreenProps {
  leftText: leftText;
  rightText: rightText;
  title: string;
  leftIcon: string;
  rightIcon: string;
  rightComponent: Element[];
  container: StyleProp<ViewStyle>;
  onPress: () => void;
}

export const Header: React.FC<headerProps> = (props) => {
  const { leftText, rightText, title, leftIcon, rightIcon } = props;

  return (
    <View style={[styles.container, props.container]}>
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        {leftText && (
          <View style={{ flexDirection: 'row' }}>
            <Image {...AppImages.navBack} />
            <Text
              style={styles.leftTextStyle}
              onPress={leftText.isBack ? props.navigation.goBack() : leftText.onPress}
            >
              {leftText.isBack ? 'Back' : leftText.title}
            </Text>
          </View>
        )}
        {leftIcon && (
          <TouchableOpacity onPress={props.onPress}>
            <Image {...AppImages[leftIcon]} />
          </TouchableOpacity>
        )}
      </View>
      <View>{title && <Text style={styles.titleTextStyle}>{title}</Text>}</View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {rightText && (
          <Text style={styles.rightTextStyle} onPress={rightText.onPress}>
            {rightText.title}
          </Text>
        )}
        {rightIcon && <Image {...AppImages[rightIcon]} />}
        {props.rightComponent && props.rightComponent()}
      </View>
    </View>
  );
};
