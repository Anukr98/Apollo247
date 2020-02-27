import { StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  containerStyle: {
    // borderRadius: 16,
    //backgroundColor: '#00b38e',
    // justifyContent: 'center',
    // alignItems: 'center',
    flexDirection: 'row',
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#0087ba',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  desc: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#02475b',
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
});
