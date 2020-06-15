import { StyleSheet, Platform } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { isIphoneX } from 'react-native-iphone-x-helper';

export default StyleSheet.create({
  headingText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
    marginBottom: 9,
  },
  labelStyle: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    marginBottom: 9,
  },

  emailStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6)),
  },
  nameStyle: {
    ...theme.viewStyles.text('B', 14, theme.colors.darkBlueColor(1)),
    marginBottom: 2,
  },
  viewStyle: {
    paddingBottom: 11,
    marginBottom: 12,
    ...theme.viewStyles.mediumSeparatorStyle,
  },
  mainView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 5,
    elevation: 500,
  },
  touchableCloseIcon: {
    marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 50,
    backgroundColor: 'white',
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginRight: 0,
    marginBottom: 8,
  },
  closeIcon: { width: 28, height: 28 },
});
