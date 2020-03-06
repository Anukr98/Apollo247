import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';
import { colors } from '@aph/mobile-doctors/src/theme/colors';

export default StyleSheet.create({
  labelText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 0.5, undefined, 0.02),
    marginBottom: 6,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 18, '#01475b'),
  },
  startend: {
    ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
    marginLeft: 22,
  },
  consultview: {
    borderRightWidth: 1,
    borderColor: theme.colors.LIGHT_BLUE,
    marginHorizontal: 14,
    marginVertical: 2,
  },
  consulttext: {
    ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
    textTransform: 'capitalize',
  },
  block: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 0.5, undefined, 0.02),
    marginTop: 32,
  },
  mainview: {
    borderBottomColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 1,
    paddingBottom: 7,
    marginBottom: 12,
  },
  iphen: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 16,
    paddingBottom: 7,
  },
  header: {
    height: 50,
    shadowColor: '#808080',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 16,
    backgroundColor: colors.CARD_BG,
  },
});
