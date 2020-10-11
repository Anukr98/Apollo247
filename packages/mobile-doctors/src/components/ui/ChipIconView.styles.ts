import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    maxWidth: '100%',
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
    maxWidth: '90%',
    color: '#ffffff',
    ...theme.fonts.IBMPlexSansSemiBold(14),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 13,
    paddingTop: 2,
    paddingBottom: 4,
    marginRight: 8,
    letterSpacing: 0.02,
  },
});
