import React from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { SpecialDiscountImage } from '../../ui/Icons';

interface SpecialTextProps {
  text: string;
  styleObj?: any;
  isImage?: boolean;
}

export const SpecialDiscountText: React.FC<SpecialTextProps> = (props) => {
  return (
    <>
      {props.isImage ? (
        <View style={props.styleObj ? props.styleObj : {}}>
          <SpecialDiscountImage style={styles.imageStyle} />
        </View>
      ) : (
        <View style={props.styleObj}>
          <Text style={[styles.specialDiscountText]}>{props.text}</Text>
        </View>
      )}
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
  discountText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10 : 10.5, theme.colors.WHITE),
    lineHeight: 13,
    textAlign: 'right',
    alignSelf: 'flex-end',
    paddingRight: 4,
  },
  imageStyle: { height: 21, width: 60, resizeMode: 'contain' },
});
