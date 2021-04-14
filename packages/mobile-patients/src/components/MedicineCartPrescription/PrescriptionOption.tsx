import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, ListItemProps } from 'react-native-elements';

export interface Props extends ListItemProps {
  checked: boolean;
}

export const PrescriptionOption: React.FC<Props> = ({ checked, ...listItemProps }) => {
  return (
    <ListItem
      containerStyle={[styles.listItemContainer, checked && styles.listItemSelected]}
      rightIcon={checked ? <RadioButtonIcon /> : <RadioButtonUnselectedIcon />}
      titleStyle={styles.title}
      {...listItemProps}
    />
  );
};

const { text, card } = theme.viewStyles;
const styles = StyleSheet.create({
  listItemContainer: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  listItemSelected: {
    ...card(14, 0, 0, '#F7F8F5', 3),
    backgroundColor: '#F7F8F5',
  },
  title: {
    ...text('M', 16, '#01475B'),
    marginBottom: 7,
  },
});
