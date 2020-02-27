import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  consultDescText: {
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    color: theme.colors.darkBlueColor(0.5),
    marginTop: 16,
    marginHorizontal: 20,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    //marginTop: 20,
  },
  //
  cardContainerStyle: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    marginTop: 16,
    padding: 16,
    paddingTop: 12,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consultationTiming: {
    ...theme.fonts.IBMPlexSansMedium(20),
    color: theme.colors.darkBlueColor(),
    letterSpacing: 0.09,
  },
  fixedSlotText: {
    ...theme.viewStyles.text('M', 14, theme.colors.APP_GREEN, 1, undefined, 0.06),
  },
  daysText: {
    ...theme.viewStyles.text('S', 12, theme.colors.LIGHT_BLUE, 1, undefined, 0.05),
    marginBottom: 6,
  },
});
