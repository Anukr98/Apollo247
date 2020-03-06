/* eslint-disable import/no-default-export */
import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  footerButtonsContainer: {
    zIndex: -1,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '92%',
  },
  buttonStyle: {
    width: '46%',
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
    margin: 1.5,
  },
});
