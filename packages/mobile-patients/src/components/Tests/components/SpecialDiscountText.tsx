import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';

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
    ...theme.viewStyles.text('M', isSmallDevice ? 10 : 10.5, theme.colors.SHERPA_BLUE),
    lineHeight: 13,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
});
