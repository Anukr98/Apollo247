import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  containerStyle: {
    borderRadius: 10,
    backgroundColor: 'rgba(0, 135, 186,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: '#0087ba',
    textAlign: 'center',
    marginHorizontal: 12,
    marginVertical: 7,
    letterSpacing: 0.5,
  },
});
