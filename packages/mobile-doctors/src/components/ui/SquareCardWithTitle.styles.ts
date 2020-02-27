import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    backgroundColor: theme.colors.CARD_GRAY_BG,
    paddingTop: 20,
    shadowOffset: {
      height: 5,
      width: 0,
    },
    shadowColor: '#808080',
    shadowRadius: 20,
    shadowOpacity: 0.4,
    elevation: 5,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    letterSpacing: 0.07,
    color: theme.colors.darkBlueColor(),
    marginHorizontal: 20,
  },
});
