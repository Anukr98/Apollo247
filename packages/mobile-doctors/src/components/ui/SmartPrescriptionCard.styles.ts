import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  containerStyle: {
    paddingVertical: 6,
  },
  seperatorline: {
    flexDirection: 'row',
    marginTop: 1,
    borderBottomColor: '#02475b',
    borderBottomWidth: 1,
    marginRight: 10,
    opacity: 0.05,
    paddingTop: 6,
    paddingBottom: 6,
  },
  titleStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(14),
  },
});
