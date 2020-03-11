/* eslint-disable import/no-default-export */
import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  consultDescText: {
    ...theme.fonts.IBMPlexSans(14),
    color: theme.colors.darkBlueColor(0.5),
    marginTop: 16,
    marginHorizontal: 20,
  },
  consultTypeText: {
    marginLeft: 20,
    marginTop: 8,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  squareCardContainer: { marginTop: 16, paddingBottom: 16 },
  addTouchable: { flexDirection: 'row', marginTop: 18, marginLeft: 20, alignItems: 'center' },
  addTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    fontSize: 14,
    marginLeft: 8,
  },
});
