/* eslint-disable import/no-default-export */
import { StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  mainview: {
    backgroundColor: '#ffffff',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: '#01475b',
    textAlign: 'center',
  },
  dataView: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
  textView: { ...theme.fonts.IBMPlexSansLight(10), color: 'rgba(1, 71, 91, 0.6)' },
  messageText: { ...theme.fonts.IBMPlexSansSemiBold(15), color: '#01475b', marginRight: 20 },
  commonview: { justifyContent: 'center', marginLeft: 5, flex: 1 },
  underline: {
    height: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f0f4f5',
  },
  scrollArea: { flex: 1, backgroundColor: '#f7f7f7' },
  chatIconContainer: {
    height: 44,
    width: 44,
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.SKY_BLUE,
    marginRight: 12,
  },
  imageStyle: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  placeHolderLoading: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  notificationContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: theme.colors.SEPARATOR_LINE,
  },
  textContainer: {
    flex: 1,
  },
  mainTextStyle: {
    ...theme.viewStyles.text('S', 15, theme.colors.SHARP_BLUE, 1, 20),
  },
  highText: {
    ...theme.viewStyles.text('SB', 15, theme.colors.SHARP_BLUE, 1, 20),
  },
  subText: {
    ...theme.viewStyles.text('S', 10, theme.colors.SHARP_BLUE, 0.6),
    marginTop: 5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextStyle: {
    ...theme.viewStyles.text('S', 15, theme.colors.SHARP_BLUE),
  },
  emptySubStyle: {
    ...theme.viewStyles.text('S', 10, theme.colors.SHARP_BLUE, 0.6),
  },
});
