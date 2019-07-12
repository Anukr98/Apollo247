import { ApploLogo, IconBaseProps } from 'app/src/components/ui/Icons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

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
  onPress: TouchableOpacityProps['onPress'];
};

export interface HeaderProps {
  rightIcons?: HeaderRightIconProps[];
  iconMarginRight?: number;
  rightComponent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Header: React.FC<HeaderProps> = (props) => {
  const { rightIcons, rightComponent, containerStyle, iconMarginRight } = props;

  return (
    <View style={[styles.container, containerStyle]}>
      <View>
        <ApploLogo />
      </View>
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
