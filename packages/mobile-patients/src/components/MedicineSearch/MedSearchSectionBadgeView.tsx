import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, BadgeProps } from 'react-native-elements';

export interface Props extends BadgeProps {}

export const MedSearchSectionBadgeView: React.FC<Props> = ({
  badgeStyle,
  textStyle,
  ...restOfProps
}) => {
  return (
    <Badge
      badgeStyle={[styles.badgeStyle, badgeStyle]}
      textStyle={[styles.textStyle, textStyle]}
      {...restOfProps}
    />
  );
};

const { text } = theme.viewStyles;
const styles = StyleSheet.create({
  badgeStyle: {
    height: 'auto',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F7F8F5',
    borderColor: '#979797',
    borderWidth: 0.5,
    borderRadius: 5,
  },
  textStyle: {
    ...text('R', 10, '#02475B'),
    paddingBottom: 1,
  },
});
