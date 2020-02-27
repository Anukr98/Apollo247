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
import NotificationHeaderStyles from '@aph/mobile-doctors/src/components/ui/NotificationHeader.styles';

const styles = NotificationHeaderStyles;

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
  timerText?: string;
  leftIcons?: HeaderRightIconProps[];
  textStyles?: StyleProp<ViewStyle>;
  timerremaintext?: string;
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
                activeOpacity={1}
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
      )}
      <View style={{ flexDirection: 'column', marginTop: 0 }}>
        <Text style={[styles.doctorNameStyles, props.textStyles]}>{props.middleText}</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.timerTextStyle}>{props.timerText}</Text>
          <Text style={styles.timeStyles}>{props.timerremaintext}</Text>
        </View>
      </View>

      {rightComponent ? (
        rightComponent
      ) : (
        <View style={styles.iconContainer}>
          {rightIcons &&
            rightIcons.map((icon, i) => (
              <TouchableOpacity
                activeOpacity={1}
                onPress={icon.onPress}
                key={i}
                style={{
                  marginRight: i !== rightIcons.length - 1 ? iconMarginRight || 12 : 0,
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
