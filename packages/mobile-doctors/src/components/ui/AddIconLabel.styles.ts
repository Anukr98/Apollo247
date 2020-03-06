/* eslint-disable import/no-default-export */
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  touchableStyle: {
    flexDirection: 'row',
    marginTop: 18,
    marginLeft: 20,
    alignItems: 'center',
  },
  addText: {
    ...theme.viewStyles.yellowTextStyle,
    fontSize: 14,
    marginLeft: 8,
  },
});
