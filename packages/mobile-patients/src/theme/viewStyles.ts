import { colors } from './colors';

export const viewStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
  },
  separator: {
    flex: 0,
    height: 1,
    marginHorizontal: 8,
    // backgroundColor: colors.LIGHT_SEPARATOR_COLOR,
  },
  shadow: {
    // shadowColor: colors.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  borderRadius: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  footerButtonStyle: {
    margin: 16,
  },
  cardViewStyle: {
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    shadowColor: colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContainer: {
    shadowColor: colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 16,
    backgroundColor: colors.CARD_BG,
  },
  shadowStyle: {
    shadowColor: colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 16,
  },
};
