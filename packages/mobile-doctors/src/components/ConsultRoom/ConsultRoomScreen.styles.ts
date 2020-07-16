import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { height, width } = Dimensions.get('window');

export const ConsultRoomScreenStyles = StyleSheet.create({
  mainview: {
    backgroundColor: '#ffffff',
    height: 50,
  },
  shadowview: {
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 0,
    backgroundColor: 'white',
  },
  imageStyle: {
    width: 32,
    height: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  automatedLeftText: {
    ...theme.viewStyles.text('M', 15, theme.colors.WHITE),
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 16,
    textAlign: 'left',
  },
  automatedRightText: {
    ...theme.viewStyles.text('M', 10, theme.colors.WHITE),
    paddingHorizontal: 16,
    paddingVertical: 4,
    textAlign: 'right',
  },
  automatedTextView: {
    backgroundColor: '#0087ba',
    marginLeft: 38,
    borderRadius: 10,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#01475b',
    paddingBottom: 20,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0,0.1)',
    zIndex: 5,
    elevation: 500,
  },
  menucontainer: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: Platform.OS === 'ios' ? (isIphoneX() ? 80 : 58) : 36,
    backgroundColor: theme.colors.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 3,
    minHeight: 20,
    minWidth: width / 3,
    borderRadius: 10,
  },
  menuTextContainer: {
    minHeight: 20,
    minWidth: width / 3,
    justifyContent: 'center',
  },
  menuItemText: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHARP_BLUE),
    marginVertical: 9,
    marginLeft: 2,
  },
  seperatorStyle: {
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.SEPARATOR_LINE,
    opacity: 0.5,
  },
  exoTelPopupContainer: {
    flex: 1,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: width,
    backgroundColor: theme.colors.blackColor(0.6),
    position: 'absolute',
    elevation: 2000,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exoTelPopupMainContainer: {
    backgroundColor: theme.colors.WHITE,
    padding: 20,
    width: width - 40,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  exoHeader: {
    ...theme.viewStyles.text('SB', 18, theme.colors.LIGHT_BLUE),
    marginBottom: 10,
  },
  exosubHeader: {
    ...theme.viewStyles.text('R', 12, '#979797'),
    marginBottom: 20,
  },
  exopointContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exoPointMain: {
    backgroundColor: theme.colors.APP_GREEN,
    height: 28,
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 3,
  },
  exoPointNumberText: {
    ...theme.viewStyles.text('B', 20, theme.colors.WHITE, 1, 28),
  },
  exoPointText: {
    ...theme.viewStyles.text('M', 14, theme.colors.APP_GREEN),
    flex: 1,
  },
  exonoteText: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHARP_BLUE),
    marginBottom: 30,
  },
  exobuttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exoCancelText: {
    ...theme.viewStyles.text('B', 12, theme.colors.APP_YELLOW, 1, 24, 0.2),
  },
  exoCancelContainer: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exoProceedText: {
    ...theme.viewStyles.text('B', 12, theme.colors.WHITE, 1, 24),
  },
  exobuttonStyle: {
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: theme.colors.APP_YELLOW,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: (width - 90) / 1.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exoMainContainer: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exoConnectText: {
    ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW, 1, 24),
    marginLeft: 9,
  },
  exoToastContainer: {
    backgroundColor: theme.colors.APP_GREEN,
    paddingVertical: 5,
    position: 'absolute',
    bottom: 30,
  },
  exoCloseContainer: {
    borderWidth: 1,
    borderColor: theme.colors.WHITE,
    borderRadius: 100,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
