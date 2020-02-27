import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    marginTop: 16,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  rowSpaceBetweendays: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  consultationTiming: {
    ...theme.fonts.IBMPlexSansMedium(20),
    color: theme.colors.darkBlueColor(),
    letterSpacing: 0.09,
  },
  fixedSlotText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#ff748e',
  },
  daysText: {
    ...theme.fonts.IBMPlexSansLight(12),
    fontFamily: 'IBMPlexSans',
    color: '#02475b',
    letterSpacing: 0.05,
    marginBottom: 19,
    //marginHorizontal: 16,
  },
  separator: {
    height: 16,
    width: 1,
    marginRight: 0,
    marginLeft: 15,
    backgroundColor: '#02475b',
    marginTop: -15,
  },
  consultationText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    letterSpacing: 0.05,
    color: '#658f9b',
    marginBottom: 19,
    marginHorizontal: 16,
  },
});
