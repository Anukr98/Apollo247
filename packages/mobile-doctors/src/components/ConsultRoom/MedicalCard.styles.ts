import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  containerStyle: {
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#02475b',
    marginTop: 12,
    //marginBottom: 14,
    marginLeft: 12,
    width: 180,
  },
  tabdata: {
    fontFamily: 'IBMPlexSans',
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 14,
    letterSpacing: 0.02,
    color: '#02475b',
    marginBottom: 14,
    marginLeft: 12,
    marginRight: 12,
  },
});
