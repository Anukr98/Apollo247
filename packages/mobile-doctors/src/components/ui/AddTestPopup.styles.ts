import { StyleSheet, Platform } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  searchTestDropdown: {
    margin: 0,
    overflow: 'hidden',
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    ...Platform.select({
      ios: {
        zIndex: 1,
      },
      android: {
        elevation: 12,
        zIndex: 2,
      },
    }),
  },
  inputView: {
    borderRadius: 0,
    borderBottomColor: '#30c1a3',
    borderBottomWidth: 1,
    color: theme.colors.SHARP_BLUE,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 10,
  },
  tabTitle: {
    color: theme.colors.SHARP_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    textAlign: 'center',
  },
  tabViewstyle: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  doneButtonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '50%',
    marginHorizontal: '25%',
  },
});
