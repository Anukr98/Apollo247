import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  containerStyle: {
    borderRadius: 16,
    backgroundColor: '#00b38e',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 12,
  },

  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#ffffff',
    marginHorizontal: 12,
    marginVertical: 7,
  },
});
