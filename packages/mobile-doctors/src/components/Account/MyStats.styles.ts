import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    // paddingLeft: 20,
  },
  mainView: {
    padding: 20,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    shadowColor: '#0c1e1e1e',
    shadowOffset: {
      width: -10,
      height: 10,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    borderColor: '#fff',
    borderRadius: 10,
    // marginHorizontal: 20,
    marginVertical: 6,
    padding: 16,
    // marginLeft: 20,
    // marginRight: 20,
    marginTop: 20,
    //marginBottom: 20,
  },
  priceStyle: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(32),
  },
  revnueDescr: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 16,
  },
  seperatorline: {
    flexDirection: 'row',
    marginTop: 1,
    borderBottomColor: '#f0f4f5',
    borderBottomWidth: 1,
    // marginRight: 0,
    // opacity: 0.05,
    paddingTop: 6,
    paddingBottom: 6,
  },
  boxView: {
    borderWidth: 1,
    borderColor: '#f0f4f5',
    padding: 16,
    marginTop: 8,
  },
  chartHeadingText: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    letterSpacing: 0.06,
  },
  paymentHeading: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0.07,
    marginTop: 4,
  },
  chartView: {
    paddingTop: 15,
  },
  paymentTextStyle: {
    color: theme.colors.APP_YELLOW,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0.07,
  },
  tabTitle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansSemiBold(13),
    textAlign: 'center',
    opacity: 0.6,
  },
  selTitle: { color: '#01475b', ...theme.fonts.IBMPlexSansSemiBold(13), textAlign: 'center' },
  tabViewstyle: {
    // backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  shadowview: {
    height: 44,
    width: '100%',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 10,
    backgroundColor: 'white',
  },
  circleStyle: {
    width: 10,
    height: 10,
    marginRight: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  chartText: {
    ...theme.fonts.IBMPlexSans(12),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 16,
    letterSpacing: 0.06,
  },
});
