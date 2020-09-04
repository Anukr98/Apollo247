import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, BadgeProps } from 'react-native-elements';

export interface Props extends BadgeProps {}

export const NotForSaleBadge: React.FC<Props> = ({ badgeStyle, textStyle, ...restOfProps }) => {
  return (
    <Badge
      badgeStyle={[styles.badgeStyle, badgeStyle]}
      textStyle={[styles.textStyle, textStyle]}
      value={'NOT FOR SALE'}
      {...restOfProps}
    />
  );
};

const styles = StyleSheet.create({
  badgeStyle: {
    ...theme.viewStyles.card(0, 0, 1, 'rgba(137,0,0,0.5)'),
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOpacity: 1,
    height: 'auto',
  },
  textStyle: {
    ...theme.viewStyles.text('M', 12, '#fff'),
    paddingBottom: 1,
  },
});
