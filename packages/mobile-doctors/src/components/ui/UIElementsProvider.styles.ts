import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  okButtonStyle: {
    paddingHorizontal: 25,
    backgroundColor: 'transparent',
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  okButtonTextStyle: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 18,
  },
  ctaWhiteButtonViewStyle: {
    flex: 1,
    minHeight: 40,
    height: 'auto',
    backgroundColor: theme.colors.WHITE,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
});
