import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: theme.colors.WHITE,
    height: height === 812 || height === 896 ? 80 : 70,
    paddingHorizontal: 20,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  absoluteStyles: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export interface StickyBottomProps {
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  children: React.ReactNode;
  defaultBG?: boolean;
  position?: boolean;
}

export const StickyBottomComponent: React.FC<StickyBottomProps> = (props) => {
  return (
    <View
      style={[
        styles.container,
        props.position ? styles.absoluteStyles : {},
        props.style,
        props.defaultBG
          ? {
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              shadowColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            }
          : null,
      ]}
    >
      {props.children}
    </View>
  );
};

StickyBottomComponent.defaultProps = {
  defaultBG: false,
  position: true,
};
