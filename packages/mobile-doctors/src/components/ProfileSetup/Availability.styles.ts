import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  // consultTypeSelection: {
  //   flexDirection: 'row',
  //   marginHorizontal: 20,
  //   marginTop: 12,
  //   marginBottom: 20,
  // },
  consultDescText: {
    ...theme.fonts.IBMPlexSans(14),
    color: theme.colors.darkBlueColor(0.5),
    marginTop: 16,
    marginHorizontal: 20,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    //marginTop: 20,
  },
});
