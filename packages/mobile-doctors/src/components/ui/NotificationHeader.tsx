import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: '#01475b',
    marginLeft: 70,
  },
  timerTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(8),
    color: 'rgba(2, 71, 91, 0.6)',
    marginLeft: 70,
    textAlign: 'center',
  },
  timeStyles: {
    ...theme.fonts.IBMPlexSansBold(8),
    color: 'rgba(2, 71, 91, 0.6)',
    textAlign: 'center',
    marginLeft: 3,
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
