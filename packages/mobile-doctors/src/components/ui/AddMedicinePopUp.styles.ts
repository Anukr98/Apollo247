import { Dimensions, StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  chipContainerStyle: {
    maxWidth: (width - 150) / 2,
    marginRight: 16,
    marginTop: 8,
  },
  chiptextStyle: {
    paddingTop: 0,
    paddingBottom: 2,
    paddingLeft: 16,
    paddingRight: 16,
    ...theme.viewStyles.text('S', 12, theme.colors.APP_GREEN),
  },
  chipSelectedTextStyle: {
    paddingTop: 0,
    paddingBottom: 2,
    paddingLeft: 16,
    paddingRight: 16,
    ...theme.viewStyles.text('SB', 12, theme.colors.WHITE),
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: '#01475b',
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderColor: theme.colors.APP_GREEN,
  },
});
