import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';

const { text, card } = theme.viewStyles;
const { WHITE } = theme.colors;

const styles = StyleSheet.create({
  linkCopied: {
    ...card(0, 0, 0),
    backgroundColor: theme.colors.APP_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export interface LinkCopiedToastProps {}

export const LinkCopiedToast: React.FC<LinkCopiedToastProps> = (props) => {
  return (
    <View style={styles.linkCopied}>
      <Text style={text('M', 13, WHITE, 1, 20)}>Link Copied</Text>
    </View>
  );
};
