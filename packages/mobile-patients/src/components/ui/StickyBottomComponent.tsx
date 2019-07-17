import React from 'react';
import { View, StyleProp, ViewStyle, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme/theme';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: theme.colors.WHITE,
    height: height === 812 || height === 896 ? 80 : 70,
    // alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
});

export interface stickyBottomProps {
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  children: React.ReactNode;
  defaultBG?: boolean;
}

export const StickyBottomComponent: React.FC<stickyBottomProps> = (props) => {
  return (
    <View
      style={[
        styles.container,
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
};
