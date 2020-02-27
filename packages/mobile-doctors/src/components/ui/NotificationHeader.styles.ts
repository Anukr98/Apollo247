import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: '#01475b',
    marginLeft: 70,
  },
  timerTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(8),
    color: 'rgba(2, 71, 91, 0.6)',
    marginLeft: 70,
    textAlign: 'center',
  },
  timeStyles: {
    ...theme.fonts.IBMPlexSansBold(8),
    color: 'rgba(2, 71, 91, 0.6)',
    textAlign: 'center',
    marginLeft: 3,
  },
});
