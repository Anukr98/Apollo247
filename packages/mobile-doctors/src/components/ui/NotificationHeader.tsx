import { ApploLogo, BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  Text,
} from 'react-native';
import { theme } from '../../theme/theme';
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    height: 56,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(15),
    color: '#01475b',
  },
});

export type HeaderRightIconProps = {
  icon: Element;
  onPress: TouchableOpacityProps['onPress'];
};

export interface HeaderProps {
  rightIcons?: HeaderRightIconProps[];
  iconMarginRight?: number;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  middleText?: string;
  leftIcons?: HeaderRightIconProps[];
}

export const NotificationHeader: React.FC<HeaderProps> = (props) => {
  const {
    leftIcons,
    rightIcons,
    leftComponent,
    rightComponent,
    containerStyle,
    iconMarginRight,
  } = props;
  return (
    <View style={[styles.container, containerStyle]}>
      {leftComponent ? (
        leftComponent
      ) : (
        <View style={styles.iconContainer}>
          {leftIcons &&
            leftIcons.map((icon, i) => (
              <TouchableOpacity
                onPress={icon.onPress}
                key={i}
                style={{
                  marginRight: i !== leftIcons.length - 1 ? iconMarginRight || 20 : 0,
                }}
              >
                {icon.icon}
              </TouchableOpacity>
            ))}
        </View>
      )}
      <Text style={styles.doctorNameStyles}>{props.middleText}</Text>
      {rightComponent ? (
        rightComponent
      ) : (
        <View style={styles.iconContainer}>
          {rightIcons &&
            rightIcons.map((icon, i) => (
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
    </View>
  );
};
