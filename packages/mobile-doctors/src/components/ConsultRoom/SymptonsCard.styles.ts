import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  containerStyle: {
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
    // marginTop: 16,
    // marginBottom: 14,
  },

  doctorNameStyles: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 1),
    marginLeft: 12,
    marginTop: 12,
    flex: 0.9,
  },
  tabdata: {
    ...theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE, 1, 18, 0),
    marginLeft: 12,
  },
});
