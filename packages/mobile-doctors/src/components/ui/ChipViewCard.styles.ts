import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    //width: 96,
    // paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
  },
  containerUnSelected: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderColor: '#00b38e',
    borderWidth: 1,
  },
  containerSelected: {
    backgroundColor: '#00b38e',
    borderRadius: 14,
  },
  textStyle: {
    color: '#00b38e',
    ...theme.fonts.IBMPlexSans(12),
    textAlign: 'center',
    justifyContent: 'center',
    paddingLeft: 13,
    paddingTop: 2,
    paddingBottom: 4,
    paddingRight: 13,
    letterSpacing: 0.02,
  },
  textSelectedStyle: {
    color: '#ffffff',
    ...theme.fonts.IBMPlexSansSemiBold(12),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingLeft: 13,
    paddingTop: 2,
    paddingBottom: 4,
    paddingRight: 13,
    letterSpacing: 0.02,
  },
});
