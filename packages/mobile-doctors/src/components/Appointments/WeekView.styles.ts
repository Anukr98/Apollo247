import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  calendarStripStyle: {
    height: 54,
    backgroundColor: 'white',
  },
  viewStyle: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    // paddingRight: 2,
    marginLeft: 4,
    // height: 48,
    width: 44,
    backgroundColor: theme.colors.WHITE,
  },
  highlightedViewStyle: {
    // width: 48,
    backgroundColor: '#00b38e',
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    letterSpacing: 0.3,
    color: 'rgba(101, 143, 155, 0.6)',
  },
  textStyleToday: {
    backgroundColor: '#00b38e',
    ...theme.fonts.IBMPlexSansBold(14),
    letterSpacing: 0.35,
    color: theme.colors.WHITE,
  },
});
