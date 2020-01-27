import { colors } from './colors';
import { getTextStyle, fonts } from '@aph/mobile-doctors/src/theme/fonts';

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
  cardContainer: {
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 16,
    backgroundColor: colors.CARD_BG,
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
  whiteRoundedCornerCard: {
    backgroundColor: colors.WHITE,
    shadowColor: colors.CARD_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
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
  text: getTextStyle,
  lightSeparatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  shadowStyle: {
    shadowColor: colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 16,
  },
  mediumSeparatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  darkSeparatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.TEXT_LIGHT_BLUE,
  },
  yellowTextStyle: {
    ...fonts.IBMPlexSansBold(13),
    color: colors.APP_YELLOW,
    lineHeight: 24,
  },
};
