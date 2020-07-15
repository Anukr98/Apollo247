import { StyleSheet, Dimensions, Platform } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { width } = Dimensions.get('screen');
export const UIElementsProviderStyles = StyleSheet.create({
  okButtonStyle: {
    paddingHorizontal: 25,
    backgroundColor: 'transparent',
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  okButtonTextStyle: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 18,
  },
  ctaWhiteButtonViewStyle: {
    flex: 1,
    minHeight: 40,
    height: 'auto',
    backgroundColor: theme.colors.WHITE,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  popUpContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 5000,
    elevation: 5000,
  },
  popUpMainContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: width - 40,
    marginHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? (isIphoneX() ? 100 : 75) : 55,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popUpPointer: {
    position: 'absolute',
    backgroundColor: theme.colors.WHITE,
    top: -9,
    right: 50,
    height: 20,
    width: 20,
    transform: [{ rotate: '45deg' }],
  },
  popUpTitleText: {
    ...theme.viewStyles.text('B', 16, theme.colors.SKY_BLUE, 1),
  },
  popUpDescriptionText: {
    ...theme.viewStyles.text('M', 15, theme.colors.SKY_BLUE, 1, 22),
  },
  okContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  okText: {
    ...theme.viewStyles.text('B', 13, theme.colors.APP_YELLOW, 1, 24),
  },
});
