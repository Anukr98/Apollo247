import { StyleSheet, Platform } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    backgroundColor: theme.colors.WHITE,
    marginBottom: 20,
  },
  titleStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(28),
    fontWeight: '600',
    color: '#02475b',
    marginHorizontal: 20,
    paddingTop: 8,
  },
  descriptionStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: '#0087ba',
    marginHorizontal: 20,
    paddingBottom: 20,
    marginTop: 4,
  },
  tabContainerShadow: {
    //...theme.viewStyles.whiteRoundedCornerCard,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  tabViewStyle: {
    flex: 1,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  tabViewActiveStyle: {
    width: '100%',
    backgroundColor: '#0087ba',
    height: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  tabTitleStyle: {
    paddingTop: 21,
    paddingBottom: 20,
    textAlign: 'center',
  },
  tabTitleActiveStyle: {
    ...theme.fonts.IBMPlexSansBold(16),
    letterSpacing: 0.11,
    color: '#02475b',
  },
  tabTitleDoneStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.11,
    color: '#02475b',
  },
  tabTitlePendingStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.11,
    color: '#02475b',
    opacity: 0.4,
  },
  textShadow: {
    ...Platform.select({
      ios: {
        ...theme.viewStyles.whiteRoundedCornerCard,
        borderRadius: 0,
        shadowOpacity: 0.1,
        marginBottom: 2,
      },
      android: { overflow: 'hidden' },
    }),
  },
  statusBarline: {
    width: '100%',
    height: 2,
  },
});
