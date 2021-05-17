import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ListItem, ListItemProps } from 'react-native-elements';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface Props extends ListItemProps {
  rightBtnTitle: string;
  rightBtnStyle?: StyleProp<ViewStyle>;
  onPressJoin: () => void;
}

export const JoinWaitingRoomView: React.FC<Props> = ({ ...props }) => {
  const renderJoinBtn = () => {
    return (
      <Button
        style={[styles.joinBtn, props.rightBtnStyle]}
        title={props.rightBtnTitle}
        titleTextStyle={styles.joinBtnTitle}
        onPress={() => props.onPressJoin()}
      />
    );
  };

  return (
    <ListItem
      containerStyle={styles.listItem}
      titleStyle={styles.leftText}
      rightTitleStyle={styles.rightText}
      {...props}
      rightElement={renderJoinBtn()}
    />
  );
};

const { text } = theme.viewStyles;
const { SHERPA_BLUE, APP_YELLOW, HEADER_GREY } = theme.colors;
const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  joinBtn: {
    width: 'auto',
    paddingHorizontal: 10,
    height: 40,
  },
  joinBtnTitle: {
    ...theme.viewStyles.text('B', 13, theme.colors.WHITE),
  },
});
