import { StyleSheet, Platform, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

const { width } = Dimensions.get('screen');
export const SharingScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  headerContainer: {
    height: 50,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1,
  },
  tabContainer: {
    // marginHorizontal: 20,
  },
  titleContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.WHITE,
  },
  titleText: { ...theme.viewStyles.text('SB', 16, theme.colors.SHARP_BLUE, 1, 23, 0.07) },
  shareContainer: {
    margin: 20,
    marginTop: 30,
  },
  shareHeadingText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 0.8, undefined, 0.02),
  },
  textInputView: {
    flexDirection: 'row',
    backgroundColor: theme.colors.WHITE,
    borderRadius: 5,
    borderWidth: 1,
    height: 44,
    paddingLeft: 16,
    borderColor: theme.colors.APP_GREEN,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonStyle: {
    position: 'absolute',
    right: 8,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainerStyle: {
    paddingHorizontal: 16,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: theme.colors.APP_YELLOW,
  },
  buttonTextStyle: {
    ...theme.viewStyles.text('SB', 14, theme.colors.WHITE, 1, 18, 0),
  },
  textInputPrefixStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
    paddingRight: 5,
  },
  textInputStyle: {
    height: 44,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 1 : 11,
    width: width - 155,
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
  },
  disabledtext: {
    height: 44,
    paddingTop: Platform.OS === 'ios' ? 13 : 12,
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
    width: width - 155,
  },
  invalidText: {
    marginTop: 4,
    marginLeft: 6,
    ...theme.viewStyles.text('S', 14, theme.colors.APP_RED),
  },
  csvContainer: {
    marginTop: 40,
  },
  csvTitleText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 0.8, 19),
  },
  iconContainer: {
    flexDirection: 'row',
    marginTop: 28,
  },
  csvIconText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW),
  },
});
