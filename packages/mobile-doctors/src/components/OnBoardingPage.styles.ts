import { StyleSheet, Platform } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

import { ifIphoneX } from 'react-native-iphone-x-helper';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f4f5',
  },
  mainView: {
    flex: 6,
    backgroundColor: '#f0f4f5',
  },
  itemContainer: {
    flex: 1,
    height: 'auto', //height === 812 || height === 896 ? height - 160 : height - 100,
    margin: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 118,
  },
  descptionText: {
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    marginTop: 20,
  },
  titleStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(24),
    textAlign: 'center',
  },
  skipView: {
    height: 40,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',

    ...Platform.select({
      ios: {
        top: -30,
      },
    }),
  },
  imageStyle: {
    marginTop: -90,
    width: '90%',
  },
  skipTextStyle: {
    color: 'rgba(2, 71, 91, 0.5)',
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
    //top: -50,
    //backgroundColor: 'red',
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
});
