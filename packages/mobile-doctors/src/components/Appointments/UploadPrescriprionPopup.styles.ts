import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  cardContainer: {
    ...theme.viewStyles.cardViewStyle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    height: 86,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 3,
  },
  yelloTextStyle: {
    ...theme.fonts.IBMPlexSansBold(10),
    color: theme.colors.APP_YELLOW,
    paddingTop: 12,
    textAlign: 'center',
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  lableStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHARP_BLUE,
    lineHeight: 20,
    letterSpacing: 0.35,
    paddingTop: 16,
    paddingBottom: 8,
  },
  instructionsStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
    lineHeight: 20,
    letterSpacing: 0.35,
  },
  cardViewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 71, 91, 0.2)',
    borderRadius: 5,
  },
  cardTextStyle: {
    padding: 8,
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansSemiBold(9),
    textAlign: 'center',
  },
  orderstpes: {
    height: 101,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.SKY_BLUE,
  },
  steps: {
    paddingTop: 13,
    paddingBottom: 12,
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  rowview: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  close: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  header: {
    ...theme.viewStyles.cardContainer,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 23,
    width: '100%',
  },
  head: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.LIGHT_BLUE,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20,
    marginHorizontal: 13,
  },
  terms: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.TEXT_LIGHT_BLUE,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
