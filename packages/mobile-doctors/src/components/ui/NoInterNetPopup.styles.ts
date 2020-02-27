import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});
