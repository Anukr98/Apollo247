import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  calendarStripStyle: {
    backgroundColor: theme.colors.CARD_BG,
    paddingHorizontal: 5,
    paddingBottom: 7,
    height: 48,
  },
  viewStyle: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
    backgroundColor: theme.colors.CARD_BG,
  },
  unSelectedDateStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.APP_GREEN,
    backgroundColor: theme.colors.CLEAR,
  },
  textStyleToday: {
    backgroundColor: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0.35,
    color: theme.colors.WHITE,
  },
  disabledTextStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: 'rgba(128,128,128, 0.3)',
    backgroundColor: theme.colors.CLEAR,
  },
});
