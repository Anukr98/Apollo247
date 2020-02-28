import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  noAppointmentsText: {
    marginTop: 25,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: 'rgba(2, 71, 91, 0.6)',
    textAlign: 'center',
  },
  calenderView: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    width: '100%',
    // height: 'auto',
  },

  menuDropdown: {
    position: 'absolute',
    top: 184,
    width: '100%',
    alignItems: 'flex-end',
    overflow: 'hidden',
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
  calendarSeparator: {
    height: 1,
    opacity: 0.1,
    borderWidth: 0.5,
    borderColor: '#02475b',
    marginLeft: 16,
    marginRight: 16,
  },
  noAppointmentsView: {
    flex: 1,
    marginTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  weekViewContainer: {
    marginTop: 16,
    backgroundColor: theme.colors.WHITE,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        shadowOpacity: 0.1,
        elevation: 12,
      },
    }),
  },
});