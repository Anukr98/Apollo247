import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
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
  headingText: {
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansMedium(15),
    marginLeft: 20,
  },
});
