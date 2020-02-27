import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 10,
  },

  containerSelected: {
    backgroundColor: '#00b38e',
    borderRadius: 16,

    // flexWrap: 'wrap',
  },
  iconView: { justifyContent: 'center', paddingRight: 6 },

  textSelectedStyle: {
    color: '#ffffff',
    ...theme.fonts.IBMPlexSansSemiBold(14),
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
