import { StyleSheet, Platform } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';

import { fonts } from '@aph/mobile-doctors/src/theme/fonts';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  mainView: {
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },
  statusBarBg: {
    width: '100%',
    opacity: 0.05,
    backgroundColor: '#000000',
    ...ifIphoneX(
      {
        height: 44,
      },
      {
        height: 24,
      }
    ),
  },
  landingText: {
    ...fonts.IBMPlexSansMedium(17),
    lineHeight: 26,
    color: '#02475b',
  },
  landingText2: {
    ...fonts.IBMPlexSansBold(17),
    letterSpacing: 0,
    color: '#02475b',
  },
  buttonView: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fc9916',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 70,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(15),
    color: theme.colors.BUTTON_TEXT,
  },
  splashview: {
    width: 76,
    height: 56,
    marginLeft: 20,
    marginBottom: 30,
    ...Platform.select({
      android: {
        top: 16,
      },
      ios: {
        top: 16,
      },
    }),
  },
  landpageview: {
    width: '100%',
    height: 243,
  },
});
