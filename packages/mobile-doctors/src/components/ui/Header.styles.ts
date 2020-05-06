import { StyleSheet, Platform } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

const textStyle = {
  color: theme.colors.SHARP_BLUE,
  ...theme.fonts.IBMPlexSansSemiBold(13),
  letterSpacing: 0.5,
};
export default StyleSheet.create({
  container: {
    height: 56,
    // borderColor: '#ddd',
    // borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  rightTextStyle: {
    ...textStyle,
    paddingRight: 14,
  },
  titleTextStyle: {
    textAlign: 'center',
    color: theme.colors.SHARP_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterContainer: {
    borderRadius: 100,
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: theme.colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
  },
  counterTextContainer: {
    height: 12,
    width: 12,
    borderRadius: 100,
    backgroundColor: theme.colors.NOTIFICATION_DOT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    ...theme.viewStyles.text('SB', 9, theme.colors.WHITE, 1),
    marginTop: Platform.OS === 'android' ? -1 : 0,
  },
});
