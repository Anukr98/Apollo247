import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    width: 52,
    height: 24,
    borderTopRightRadius: 10,
    backgroundColor: '#ff748e',
    justifyContent: 'center',
    borderBottomRightRadius: 10,
  },
  labelstyle: {
    textAlign: 'center',
    color: '#ffffff',
    ...theme.fonts.IBMPlexSansBold(12),
  },
});
