import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

interface SpecialTextProps {
  text: string;
  styleObj: any;
}

export const SpecialDiscountText: React.FC<SpecialTextProps> = (props) => {
  return (
    <>
      <View style={props.styleObj}>
        <Text style={[styles.specialDiscountText]}>{props.text}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  specialDiscountText: {
    ...theme.viewStyles.text('M', 10.5, theme.colors.SHERPA_BLUE),
    lineHeight: 13,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
});
