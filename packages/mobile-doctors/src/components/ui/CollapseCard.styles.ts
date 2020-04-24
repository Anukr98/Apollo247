import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  headingText: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(17),
    textAlign: 'left',
    justifyContent: 'center',
    flex: 1,
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
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
  },
  arrowview: {
    justifyContent: 'center',
  },
});
