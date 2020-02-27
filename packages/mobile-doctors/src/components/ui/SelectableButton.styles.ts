import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    //width: 96,
    // paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  containerUnSelected: {
    backgroundColor: '#ffffff',
  },
  containerSelected: {
    backgroundColor: '#00b38e',
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    textAlign: 'center',
    color: '#00b38e',
    marginTop: 12,
    marginBottom: 12,
    marginRight: 20,
  },
  textSelectedStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 12,
    marginRight: 20,
  },
});
