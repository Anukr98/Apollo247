import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface CareLogoProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CareLogo: React.FC<CareLogoProps> = (props) => {
  const { style, textStyle } = props;
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>{string.careDoctors.care}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 20,
    backgroundColor: theme.colors.DEEP_RED,
    borderRadius: 5,
    justifyContent: 'center',
  },
  text: {
    ...theme.viewStyles.text('M', 7, 'white'),
    textAlign: 'center',
  },
});
