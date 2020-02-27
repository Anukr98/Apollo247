import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import StickyBottomComponentStyles from '@aph/mobile-doctors/src/components/ui/StickyBottomComponent.styles';

const { height } = Dimensions.get('window');

const styles = StickyBottomComponentStyles;
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
