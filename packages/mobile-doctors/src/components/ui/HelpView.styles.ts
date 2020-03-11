import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export const styles = StyleSheet.create({
  helpview: {
    flexDirection: 'row',
    margin: 20,
    // marginHorizontal: 20,
    marginTop: 12,
    justifyContent: 'center',
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
  },
  helptext: {
    color: '#fc9916',
    ...theme.fonts.IBMPlexSansSemiBold(16),
    lineHeight: 22,
  },
});
