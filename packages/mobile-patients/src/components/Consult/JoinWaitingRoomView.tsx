import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, ListItemProps } from 'react-native-elements';

export interface Props extends ListItemProps {}

export const JoinWaitingRoomView: React.FC<Props> = ({ ...props }) => {
  return (
    <ListItem
      containerStyle={styles.listItem}
      titleStyle={styles.leftText}
      rightTitleStyle={styles.rightText}
      {...props}
    />
  );
};

const { text } = theme.viewStyles;
const { SHERPA_BLUE, APP_YELLOW, HEADER_GREY } = theme.colors;
const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    margin: 0,
    backgroundColor: HEADER_GREY,
    alignItems: 'center',
    minHeight: 46,
  },
  leftText: {
    ...text('M', 12, SHERPA_BLUE),
  },
  rightText: {
    ...text('B', 13, APP_YELLOW),
    textAlign: 'center',
  },
});
