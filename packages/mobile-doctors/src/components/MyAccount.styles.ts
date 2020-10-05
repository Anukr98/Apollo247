import { StyleSheet, Platform, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

const { height, width } = Dimensions.get('window');

export const MyAccountStyles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.WHITE },
  safeAreaStyle: { flex: 1, backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR },
  viewMainContainer: {
    flex: 1,
    marginTop: 26,
    // marginHorizontal: 20,
  },
  ivrCardContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  cardTextStyle: {
    flex: 1,
    ...theme.viewStyles.text('M', 12, theme.colors.SHARP_BLUE, 1, 18, 0.02),
  },
  cardNextIcon: {
    width: 24,
    height: 24,
    transform: [{ rotate: '90deg' }],
  },
  cardNextUpIcon: {
    width: 24,
    height: 24,
  },
  yesTextStyle: {
    marginRight: 10,
    ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW, 1, undefined, 0.03),
  },
  noTextStyle: {
    marginRight: 10,
    ...theme.viewStyles.text('M', 12, '#979797', 1, undefined, 0.03),
  },
  outerCircleStyle: {
    height: 18,
    width: 18,
    borderRadius: 100,
    borderColor: theme.colors.APP_GREEN,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircleStyle: {
    height: 10,
    width: 10,
    borderRadius: 100,
    backgroundColor: theme.colors.APP_GREEN,
  },
  ivrDetailsContainer: {
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  ivrSubHeadingStyle: {
    marginBottom: 22,
    ...theme.viewStyles.text('R', 12, '#757474', 1, undefined, 0.02),
  },
  ivrOptionsContainer: {
    marginRight: 30,
  },
  ivrOptionsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ivrSelectedText: {
    marginLeft: 10,
    ...theme.viewStyles.text('M', 14, theme.colors.APP_GREEN, 1, undefined, 0.02),
  },
  ivrDeselectedText: {
    marginLeft: 10,
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 1, undefined, 0.03),
  },
  timingMainContainer: { marginTop: 30 },
  dropContainer: { width: '40%' },
  materialMenuMenuContainerStyle: { marginTop: 34, marginLeft: 0 },
  materialMenuItemContainer: { height: 44.8, marginHorizontal: 12, width: '50%' },
  materialMenuItemTextStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE, 1, undefined, 0.03),
    paddingHorizontal: 0,
  },
  materialMenuSelectedTextStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.APP_GREEN, 1, undefined, 0.03),
    alignSelf: 'flex-start',
  },
  materialMenuBottomPadding: { paddingBottom: 20 },
  materialMenuViewContainer: { flexDirection: 'row', marginBottom: 8, marginTop: 8 },
  materialMenuViewSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    paddingTop: 0,
    paddingBottom: 3,
    paddingRight: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  materialMenuTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    flexDirection: 'row',
  },
  materialMenuTextContainer2: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    flexDirection: 'row',
    flex: 1,
  },
  materialMenuDisplayText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE, 1, undefined, 0.03),
  },
  materialMenuDisplaySubText: {
    ...theme.viewStyles.text('R', 10, '#979797', 1, undefined, 0.03),
    marginRight: 10,
  },
  materialMenuDisplaySubText2: {
    ...theme.viewStyles.text('R', 10, '#979797', 1, undefined, 0.03),
    flex: 1,
    textAlign: 'center',
  },
  buttonContainer: { marginHorizontal: 20, paddingTop: 10 },
  savedTextStyle: {
    marginLeft: 8,
    ...theme.viewStyles.text('M', 12, '#788080', 0.5, undefined, 0.03),
  },
  saveTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  followupInfoText: {
    ...theme.viewStyles.text('R', 10, '#979797', 1, 12, 1),
    marginLeft: 10,
    marginRight: 20,
  },
});
