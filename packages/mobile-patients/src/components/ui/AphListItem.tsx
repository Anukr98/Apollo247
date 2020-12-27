import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ListItem, ListItemProps } from 'react-native-elements';

export interface AphListItemProps extends ListItemProps {}

export const AphListItem: React.FC<AphListItemProps> = ({ title, onPress }) => {
  return (
    <ListItem
      title={title}
      rightAvatar={<ArrowRight />}
      pad={16}
      containerStyle={styles.listItemContainer}
      titleStyle={styles.listItemTitle}
      onPress={onPress}
      Component={TouchableOpacity}
    />
  );
};

const { text, card } = theme.viewStyles;
const { LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  listItemContainer: {
    ...card(),
  },
  listItemTitle: {
    ...text('M', 17, LIGHT_BLUE),
  },
});
