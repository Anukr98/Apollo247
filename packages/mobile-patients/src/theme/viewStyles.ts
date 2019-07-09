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
};
