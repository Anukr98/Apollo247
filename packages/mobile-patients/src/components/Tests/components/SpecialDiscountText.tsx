import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
const width = Dimensions.get('window').width;

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
    ...theme.viewStyles.text('M', width > 380 ? 10.5 : 10, theme.colors.SHERPA_BLUE),
    lineHeight: 13,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
});
