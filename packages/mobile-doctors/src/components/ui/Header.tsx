import { ApploLogo } from '@aph/mobile-doctors/src/components/ui/Icons';
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
import { theme } from '@aph/mobile-doctors/src/theme/theme';

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});

export type HeaderRightIconProps = {
  icon: Element;
  onPress?: TouchableOpacityProps['onPress'];
};

export interface HeaderProps {
  rightIcons?: HeaderRightIconProps[];
  leftIcons?: HeaderRightIconProps[];
  iconMarginRight?: number;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  headerText?: string;
}

export const Header: React.FC<HeaderProps> = (props) => {
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
      <View>
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
                    marginRight: i !== leftIcons.length - 1 ? iconMarginRight || 12 : 0,
                  }}
                >
                  {icon.icon}
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>
      <Text
        style={{
          ...theme.fonts.IBMPlexSansSemiBold(13),
          color: '#01475b',
          textAlign: 'center',
        }}
      >
        {props.headerText}
      </Text>
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
