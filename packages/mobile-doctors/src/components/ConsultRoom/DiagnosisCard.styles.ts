import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Dimensions, Platform } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.APP_GREEN,
    borderRadius: 100,
    padding: 6,
    margin: 5,
    maxWidth: width - 60,
  },

  diseaseNameStyles: {
    ...theme.viewStyles.text('SB', 14, theme.colors.WHITE),
    marginHorizontal: 10,
    padding: 1,
    marginVertical: Platform.OS === 'android' ? -2 : 0,
    maxWidth: '90%',
  },
});
