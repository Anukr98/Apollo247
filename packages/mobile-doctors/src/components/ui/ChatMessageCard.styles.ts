import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  headingText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(17),
    marginLeft: 16,
    textAlign: 'left',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  receiveText: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    marginLeft: 16,
    textAlign: 'left',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    marginBottom: 20,
  },
});
