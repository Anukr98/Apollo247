import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  headingText: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(17),
    margin: 16,
    textAlign: 'left',
    justifyContent: 'center',
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 5,
    marginLeft: 20,
    marginRight: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },

  arrowview: {
    marginTop: 16,
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 16,
  },
});
