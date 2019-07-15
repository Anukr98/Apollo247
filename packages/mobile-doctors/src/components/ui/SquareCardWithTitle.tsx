import { theme } from 'app/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.CARD_GRAY_BG,
    paddingTop: 20,
    shadowOffset: {
      height: 5,
      width: 0,
    },
    shadowColor: '#808080',
    shadowRadius: 20,
    shadowOpacity: 0.4,
    elevation: 5,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    letterSpacing: 0.07,
    color: theme.colors.darkBlueColor(),
    marginHorizontal: 20,
  },
});

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
