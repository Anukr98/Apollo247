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
  },
  whiteRoundedCornerCard: {
    backgroundColor: colors.WHITE,
    shadowColor: colors.CARD_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderRadius: 10,
    elevation: 10,
  },
  graySquareCard: {
    backgroundColor: colors.CARD_GRAY_BG,
    shadowColor: colors.CARD_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 20,
    elevation: 5,
  },
  ProgressBarTabShadow: {
    backgroundColor: colors.WHITE,
    shadowColor: colors.CARD_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 20,
    elevation: 5,
  },
  borderRadius: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
};
