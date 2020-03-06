import { StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  containerListStyle: {
    padding: 16,
    paddingTop: 12,
    borderRadius: 5,
    backgroundColor: theme.colors.CARD_BG,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  subheading: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#02475b',
    marginVertical: 20,
  },
  inputArea: {
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30c1a3',
    color: '#01475b',

    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 20,
    marginBottom: 10,
  },

  AphInnerView: {
    shadowColor: '#66000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.5,
    elevation: 5,

    padding: 20,
    ...theme.viewStyles.container,
  },
  headerview: {
    height: 50,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  commonview: { marginLeft: 0, marginTop: 9 },
});
