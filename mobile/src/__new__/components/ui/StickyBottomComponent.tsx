import React from 'react';
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    backgroundColor: theme.colors.WHITE,
    height: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
});

export interface stickyBottomProps {
  style: StyleProp<ViewStyle>;
  backgroundColor: string;
  children: Element[];
}

export const StickyBottomComponent: React.FC<stickyBottomProps> = (props) => {
  return (
    <View
      style={[
        styles.container,
        props.backgroundColor
          ? { backgroundColor: props.backgroundColor, shadowColor: props.backgroundColor }
          : null,
      ]}
    >
      {props.children}
    </View>
  );
};
