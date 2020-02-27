import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mainview: {
    marginLeft: 20,
    marginBottom: 20,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: '#003646',
    letterSpacing: 0.05,
  },
  textview: {
    fontFamily: 'IBMPlexSans',
    fontSize: 15,
    color: '#003646',
  },
});
