import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 24,
    borderTopRightRadius: 10,
    backgroundColor: '#ff748e',
    justifyContent: 'center',
    borderBottomRightRadius: 10,
  },
  labelstyle: {
    textAlign: 'center',
    color: '#ffffff',
    ...theme.fonts.IBMPlexSansBold(12),
  },
});

export interface TagCardProps {
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TagCard: React.FC<TagCardProps> = (props) => {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <Text style={[styles.labelstyle, props.labelStyle]}>{props.label}</Text>
    </View>
  );
};
