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
  headerview: {
    height: 50,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  type: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#02475b',
    marginBottom: 16,
    marginLeft: 20,
    marginTop: 20,
  },
  typeView: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  commonType: {
    marginLeft: 20,
    marginTop: 8,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  hours: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#02475b',
    marginLeft: 20,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  block: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#02475b',
    marginLeft: 20,
    marginTop: 32,
  },
});
