import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  headingText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
    marginBottom: 9,
  },
  labelStyle: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    marginBottom: 9,
  },

  emailStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6)),
  },
  nameStyle: {
    ...theme.viewStyles.text('B', 14, theme.colors.darkBlueColor(1)),
    marginBottom: 2,
  },
  viewStyle: {
    paddingBottom: 11,
    marginBottom: 12,
    ...theme.viewStyles.mediumSeparatorStyle,
  },
});
