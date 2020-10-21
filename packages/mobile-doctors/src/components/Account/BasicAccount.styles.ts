/* eslint-disable import/no-default-export */
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
  mci: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(12),
    marginLeft: 20,
    marginTop: 2,
    marginBottom: 12,
  },
  iconview: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 20,
    alignItems: 'center',
  },
  righticon: { alignItems: 'flex-end', flex: 1, marginRight: 20 },
  shadow: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  profile: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
    marginLeft: 20,
    marginTop: 12,
  },
  imageStyle: {
    minHeight: 178,
    width: '100%',
    backgroundColor: theme.colors.WHITE,
  },
  shareLinkContainer: {
    marginHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    paddingTop: 12,
    borderColor: theme.colors.SEPARATOR_LINE,
  },
  linkIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  shareHeaderText: {
    ...theme.viewStyles.text('M', 14, theme.colors.blackColor(0.6)),
  },
  shareText: {
    ...theme.viewStyles.text('B', 14, theme.colors.APP_YELLOW),
    marginLeft: 12,
  },
});
