import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import SquareCardWithTitleStyles from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle.styles';

const styles = SquareCardWithTitleStyles;

export interface SquareCardWithTitleProps {
  title: string;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SquareCardWithTitle: React.FC<SquareCardWithTitleProps> = (props) => {
  const { title, textStyle, containerStyle } = props;
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.textStyle, textStyle]}>{title}</Text>
      {props.children}
    </View>
  );
};
